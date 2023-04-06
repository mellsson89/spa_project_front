import React, {useCallback, useEffect} from "react";
import {createPortal} from 'react-dom';
import styled from './styled/modal.module.scss';


export default function Modal({onClose,children})  {

    const modalRoot=document.querySelector('#modal-root');

    const closeModalEscape = useCallback((e) => {

        if (e.code === "Escape") {
            onClose();
        }
    },[onClose])


    useEffect(() => {
        window.addEventListener('keydown',closeModalEscape)
        return () => {
            window.removeEventListener('keydown', closeModalEscape)
        }
    },[closeModalEscape])


//
    const  closeClickModal=(e) => {
        if(e.target === e.currentTarget) {
            onClose();
        }
    }

    return createPortal(<div className={styled.Modal__backdrop} onClick={closeClickModal}>
        <div className={styled.Modal__content}>{children}</div>
    </div>,modalRoot)

}
