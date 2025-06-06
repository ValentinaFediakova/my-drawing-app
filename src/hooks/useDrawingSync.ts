import { MutableRefObject, RefObject } from "react";
import { useEffect } from "react";
import { PALETTE_COLORS } from "@/constants";
import { DrawingManager } from "@/utils/DrawingManager";
import { WebSocketClient } from "@/utils/websocket";
import { WsData, HistoryMessage, WebSocketMessage, ShapeType } from "@/types";

interface UseDrawingSyncParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  userIdRef: MutableRefObject<string | null>;
  wsRef: MutableRefObject<WebSocketClient>;
  userCanvases: MutableRefObject<Map<string, HTMLCanvasElement>>;
  usersDrawingManagers: MutableRefObject<Map<string, DrawingManager>>;
  usersSettings: MutableRefObject<Map<string, WsData>>;
  containerCanvasesRef: RefObject<HTMLDivElement | null>;
  usersNameElements: MutableRefObject<Map<string, HTMLDivElement>>;
  sendWsData: (data: WsData) => void;
}

function isHistoryMessage(data: unknown): data is HistoryMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as { type?: string }).type === "history" &&
    "events" in data &&
    Array.isArray((data as { events?: unknown }).events)
  );
}

export const useDrawingSync = ({
  canvasRef,
  userIdRef,
  wsRef,
  userCanvases,
  usersDrawingManagers,
  usersSettings,
  containerCanvasesRef,
  usersNameElements,
  sendWsData,
}: UseDrawingSyncParams) => {
  const ensureUserInitialized = (userId: string) => {
    if (!userCanvases.current.has(userId) && containerCanvasesRef.current) {
      const newCanvas = document.createElement("canvas");
      newCanvas.classList.add("other-user");
      newCanvas.width = window.innerWidth;
      newCanvas.height = window.innerHeight;
      newCanvas.style.position = "absolute";
      newCanvas.style.left = "0";
      newCanvas.style.top = "0";
      newCanvas.style.pointerEvents = "none";
      newCanvas.style.zIndex = "1";

      containerCanvasesRef.current.appendChild(newCanvas);
      userCanvases.current.set(userId, newCanvas);

      // --- preview-img-canvas ---
      const previewCanvas = document.createElement("canvas");
      previewCanvas.classList.add("previewCanvas-for-img");
      previewCanvas.width = window.innerWidth;
      previewCanvas.height = window.innerHeight;
      previewCanvas.style.position = "absolute";
      previewCanvas.style.left = "0";
      previewCanvas.style.top = "0";
      previewCanvas.style.pointerEvents = "none";
      previewCanvas.style.zIndex = "2";
      containerCanvasesRef.current.appendChild(previewCanvas);
      const previewCtx = previewCanvas.getContext("2d");

      const manager = new DrawingManager(newCanvas);
      if (previewCtx) {
        manager.setPreviewCtx(previewCtx);
      }
      usersDrawingManagers.current.set(userId, manager);
    }
  };

  const applyBrushSettings = (manager: DrawingManager, settings: WsData) => {
    manager.setTool(settings.tool || "pencil");
    manager.setBrushSettings(
      settings.lineWidth ?? 5,
      settings.eraserLineWidth ?? 25,
      settings.color ?? PALETTE_COLORS.BLACK,
      settings.opacity ?? 1
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    wsRef.current?.connect(
      (data: WebSocketMessage) => {
        if (isHistoryMessage(data)) {
          data.events.forEach((event) => {
            wsRef.current?.handleIncomingEvent(event);
          });

          return;
        }

        const {
          tool = "pencil",
          lineWidth = 5,
          eraserLineWidth = 25,
          color = PALETTE_COLORS.BLACK,
          fontSize = 24,
          outline = ["Normal"],
          opacity = 1,
          type,
          points,
          key,
          userId,
          name,
          shapeType,
          src,
          width,
          height,
          id: imageId,
        } = data;

        if (!userId || userId === userIdRef.current) return;

        ensureUserInitialized(userId);

        const manager = usersDrawingManagers.current.get(userId);
        const prevSettings = usersSettings.current.get(userId) || {};
        usersSettings.current.set(userId, {
          ...prevSettings,
          ...data,
        });
        const settings = usersSettings.current.get(userId);

        if (!manager) return;

        switch (type) {
          case "setTool": {
            if (settings) {
              applyBrushSettings(manager, settings);
            }
            break;
          }
          case "setTextSettings": {
            break;
          }
          case "startDraw": {
            if (!points) return;

            if (tool === "eraser" || tool === "pencil") {
              manager.startDraw(points[0]);
            }

            if (tool === "writeText") {
              manager.startWriteText(points[0]);
            }

            break;
          }

          case "inDrawProgress": {
            if (!points) return;

            if (settings) {
              applyBrushSettings(manager, settings);
            }

            manager.draw(points[0]);

            const nameEl = usersNameElements.current.get(userId);
            if (nameEl) {
              nameEl.style.left = `${points[0].x}px`;
              nameEl.style.top = `${points[0].y - 20}px`;
            }

            const existingEl = usersNameElements.current.get(userId);
            if (!existingEl && name) {
              const nameEl = document.createElement("div");
              nameEl.innerText = name;
              nameEl.className = "user-name-cursor";
              nameEl.style.left = `${points[0].x}px`;
              nameEl.style.top = `${points[0].y - 20}px`;
              containerCanvasesRef.current?.appendChild(nameEl);
              usersNameElements.current.set(userId, nameEl);
            }

            break;
          }

          case "writeText": {
            if (!key) return;

            if (settings) {
              manager.setTextSettings(
                settings.color ?? PALETTE_COLORS.BLACK,
                settings.fontSize ?? 24,
                settings.outline ?? ["Normal"]
              );
            }

            manager.writeText(key);

            const { width, height } = manager.getWidthAndHeightOfText();
            const nameEl = usersNameElements.current.get(userId);
            if (nameEl && settings?.lastPoint) {
              nameEl.style.left = `${settings.lastPoint.x - width / 2}px`;
              nameEl.style.top = `${settings.lastPoint.y + height - 20}px`;
            }

            break;
          }

          case "end": {
            if (!settings || !points) return;
            if (tool === "shape" && points.length === 2) {
              const isWs = true;
              manager.finalizeDrawShape(
                {
                  shapeType: (shapeType ??
                    settings.shapeType ??
                    "rectangle") as ShapeType,
                  startShapePoint: points[0],
                  endShapePoint: points[1],
                  color: settings.color ?? "#000000",
                  lineWidth: settings.lineWidth ?? 5,
                  opacity: settings.opacity ?? 1,
                  previewCtx: manager.getCtx(),
                },
                isWs
              );
            }

            if (tool === "pencil" || tool === "eraser") {
              manager.stopDraw();
            }

            break;
          }

          case "addImage": {
            if (!src || width === undefined || !imageId || !points) return;
            manager.drawImageOnCanvasTool(
              src,
              points[0],
              width,
              opacity,
              undefined,
              imageId
            );
            break;
          }

          case "moveImage": {
            if (!imageId || !points) return;
            manager.moveImageById(imageId, points[0]);

            break;
          }
          case "resizeImage": {
            if (!imageId || width === undefined || height === undefined) return;
            manager.resizeImageById(imageId, width, height);
            break;
          }

          case "deleteImage": {
            if (!imageId) return;

            manager.deleteImageById(imageId);
            break;
          }

          case "addOrUpdateImage": {
            if (
              !src ||
              width === undefined ||
              height === undefined ||
              !imageId ||
              !points
            )
              return;

            manager.drawImageOnCanvasTool(
              src,
              points[0],
              width,
              opacity,
              height,
              imageId
            );
            break;
          }

          case "requestCurrentSettings": {
            sendWsData({
              type: "setTool",
              tool,
              lineWidth,
              eraserLineWidth,
              color,
              opacity,
              shapeType: tool === "shape" ? shapeType : undefined,
            });

            if (tool === "writeText") {
              sendWsData({
                type: "setTextSettings",
                color,
                fontSize,
                outline,
              });
            }
            break;
          }
          default:
            console.warn("Unknown type received:", type);
        }
      },
      () => {
        sendWsData({ type: "requestCurrentSettings" });
      }
    );

    return () => {
      wsRef.current?.close();
    };
  }, []);
};
