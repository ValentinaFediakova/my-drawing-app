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
      newCanvas.width = window.innerWidth;
      newCanvas.height = window.innerHeight;
      newCanvas.style.position = "absolute";
      newCanvas.style.left = "0";
      newCanvas.style.top = "0";
      newCanvas.style.pointerEvents = "none";
      newCanvas.style.zIndex = "1";

      containerCanvasesRef.current.appendChild(newCanvas);
      userCanvases.current.set(userId, newCanvas);

      const manager = new DrawingManager(newCanvas);
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
          console.log(">>>> data history", data);
          data.events.forEach((event) => {
            const type = event.type ?? "startDraw";

            if (
              type === "startDraw" ||
              type === "inDrawProgress" ||
              type === "writeText" ||
              type === "end" ||
              type === "setTool" ||
              type === "setTextSettings"
            ) {
              const safeEvent: WsData = {
                ...event,
                type,
                tool: event.tool ?? "pencil",
                points: event.points ?? [],
                shapeType: event.shapeType,
              };

              wsRef.current?.handleIncomingEvent(safeEvent);
            }
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
        } = data;

        if (!userId || userId === userIdRef.current) return;
        ensureUserInitialized(userId);

        if (type === "requestCurrentSettings") {
          sendWsData({
            type: "setTool",
            tool,
            lineWidth,
            eraserLineWidth,
            color,
            opacity,
            shapeType,
          });

          if (tool === "writeText") {
            sendWsData({
              type: "setTextSettings",
              color,
              fontSize,
              outline,
            });
          }
          return;
        }

        if (type === "setTool" && userId) {
          usersSettings.current.set(userId, {
            tool,
            color,
            lineWidth,
            eraserLineWidth,
            opacity,
            name,
            shapeType,
          });
        }

        if (type === "setTextSettings" && userId) {
          const prev = usersSettings.current.get(userId) || {};
          usersSettings.current.set(userId, {
            ...prev,
            color,
            fontSize,
            outline,
            name,
          });
        }

        if (type === "startDraw" && userId !== userIdRef.current) {
          const currentSettings = usersSettings.current.get(userId) || {};

          usersSettings.current.set(userId, {
            ...currentSettings,
            tool,
            color,
            opacity,
            lineWidth,
            eraserLineWidth,
            fontSize,
            outline,
            name,
            lastPoint: points?.[0],
            shapeType: shapeType,
          });

          const manager = usersDrawingManagers.current.get(userId);

          if (!manager || !points || !points[0]) return;

          const settings = usersSettings.current.get(userId);
          if (settings) {
            applyBrushSettings(manager, settings);
          }

          if (tool === "eraser" || tool === "pencil") {
            manager.startDraw(points[0]);
          }

          if (tool === "writeText") {
            manager.startWriteText(points[0]);
          }
        }

        if (type === "inDrawProgress" && userId !== userIdRef.current) {
          const manager = usersDrawingManagers.current.get(userId);
          if (!manager || !points || !points[0]) return;

          const settings = usersSettings.current.get(userId);
          if (settings) {
            applyBrushSettings(manager, settings);
          }

          manager.draw(points[0]);

          const nameEl = usersNameElements.current.get(userId);
          if (nameEl) {
            nameEl.style.left = `${points[0].x}px`;
            nameEl.style.top = `${points[0].y - 20}px`;
          }
        }

        if (type === "writeText" && userId !== userIdRef.current) {
          const manager = usersDrawingManagers.current.get(userId);
          if (!manager || !key) return;

          const settings = usersSettings.current.get(userId);
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
        }

        if (type === "end" && userId !== userIdRef.current) {
          const manager = usersDrawingManagers.current.get(userId);
          if (!manager) return;

          const settings = usersSettings.current.get(userId);
          if (!settings) return;

          if (tool === "shape" && points?.length === 2) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            manager.finalizeDrawShape({
              shapeType: (shapeType ??
                settings.shapeType ??
                "rectangle") as ShapeType,
              startShapePoint: points[0],
              endShapePoint: points[1],
              color: settings.color ?? "#000000",
              lineWidth: settings.lineWidth ?? 5,
              opacity: settings.opacity ?? 1,
              previewCtx: canvas.getContext("2d") as CanvasRenderingContext2D,
            });
          }

          if (tool === "pencil" || tool === "eraser") {
            manager.stopDraw();
          }
        }

        if (!points || !points[0]) return;
        const existingEl = usersNameElements.current.get(userId);
        if (!existingEl) {
          const nameEl = document.createElement("div");
          nameEl.innerText = name || "Anonymous";
          nameEl.className = "user-name-cursor";
          nameEl.style.left = `${points[0].x}px`;
          nameEl.style.top = `${points[0].y - 20}px`;
          containerCanvasesRef.current?.appendChild(nameEl);
          usersNameElements.current.set(userId, nameEl);
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
