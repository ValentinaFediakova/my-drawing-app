import { useRef, useState } from 'react';
import { FONT_SIZE } from '../../../constants';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { setFontSize } from "@/store/slices/settingsSlice";
import { useClickOutside } from '@/utils/useClickOutside';

import './Dropdown.scss';


export const Dropdown: React.FC = ({ }) => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null!);

  useClickOutside(dropdownRef, () => setIsOpenDropdown(false));

  const dispatch = useDispatch();
  const fontSize = useSelector((state: RootState) => state.settings.fontSize);

  const handleClickDropdownItem = (size: number) => {
    setIsOpenDropdown(false)
    dispatch(setFontSize(size))
  }

  return (
    <div ref={dropdownRef} className="dropdown__wrapper">
      <div className="dropdown__size-text">{fontSize}</div>
      <button className="dropdown__open-button" onClick={() => setIsOpenDropdown(!isOpenDropdown)}></button>
      <div className={isOpenDropdown ? `dropdown__content dropdown__content_visible` : `dropdown__content dropdown__content_hidden`}>
        <div className='dropdown__items'>
          {FONT_SIZE.map((size, index) => (
            <div key={index} className="dropdown__item" onClick={() => handleClickDropdownItem(size)}>{size}</div>
          ))}
        </div>
      </div>
    </div>
  )
}