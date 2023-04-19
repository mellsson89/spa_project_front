import React,{useState} from 'react';
import styled from './styled/comments.module.scss';
import {Button} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AttachmentIcon from '@mui/icons-material/Attachment';
import PhotoIcon from '@mui/icons-material/Photo';
import FsLightbox from "fslightbox-react";
import LinkIcon from '@mui/icons-material/Link';
import ModalFile from "../ModalFile";
import Modal from "../Modal";
import CommentForm from "../CommentForm";


const Comments = ({comments}) => {
    const [toggler, setToggler] = useState(false);
    const [fileRead, setFileRead] = useState('');
    const [img, setImg] = useState(null);
    const [showModalFile, setShowModalFile] = useState(false);
    const [showModalForm, setShowModalForm] = useState(false);
    const [parentId, setParentId] = useState(null);
    const [prevText, setPrevText] = useState(null);

    const handleFile = async (urlFile) => {
        const response = await fetch(`http://localhost:5000/${urlFile}`);
        const file = await response.blob();
        if(urlFile) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                setFileRead(reader.result);
                setShowModalFile(!showModalFile);
            }

            reader.onerror = () => {
                console.log(reader.error)
            }
        }
    }

    const openImg = (urlImg) => {
        const img = `http://localhost:5000/${urlImg}`;
        setImg(img);
        setToggler(!toggler)
    }

    const toggleModalFile = () => {
        setShowModalFile(!showModalFile);
    }



    const handleRepliesComment = (id,text) => {
        setParentId(id);
        setPrevText(text);
        setShowModalForm(!showModalForm);
    }


    return (
        <>
                {comments.map(({id, name, home_page, text, prevText,createdAt, avatar, url_file, children}) => {
                    const [date, time] = createdAt.split(' ');

                   const file = url_file?.split('/')[0] === 'files';
                   const img = url_file?.split('/')[0] === 'img';

                    return (
                            <div key={id}>
                                <div className={styled.header_comment}>
                                    {avatar && <Avatar alt="Avatar" src={avatar} />}
                                    <p className={styled.name}>{name}</p>
                                    <p className={styled.date}>{`${date} в ${time}`}</p>
                                    {file && <AttachmentIcon fontSize="small" sx={{cursor:'pointer', marginRight: home_page ? '10px' : 0}} onClick={() => handleFile(url_file)}/>}
                                    {img && <PhotoIcon fontSize="small" sx={{cursor:'pointer', marginRight: home_page ? '10px' : 0}}  onClick={() => openImg(url_file)}/>}
                                    {home_page && <a href={home_page} title='Home Page' target='_blank'><LinkIcon fontSize="small"/></a> }
                                </div>
                                <div className={styled.text} >
                                    {prevText && <p className={styled.prevText} dangerouslySetInnerHTML={{__html: prevText}}></p>}
                                        <p dangerouslySetInnerHTML={{__html: text}} >
                                    </p>
                                </div>
                             <div style={{marginBottom:'20px', marginRight: '5px', textAlign:'right'}}>
                                 <Button
                                     variant="outlined"
                                     size="small"
                                     onClick={() => handleRepliesComment(id,text)}>Ответить</Button>
                             </div>
                               <div style={{paddingLeft:'20px'}}>
                                   {children && children.length !== 0 ? <Comments comments={children}/> : false}
                               </div>
                            </div>

                    )
                })}


            {showModalFile && fileRead && <ModalFile onClose={toggleModalFile}><p>{fileRead}</p></ModalFile>}
            {showModalForm && parentId && <Modal onClose={setShowModalForm}><CommentForm  onClose={setShowModalForm} parentId={parentId} prevText={prevText}/></Modal>}
            <FsLightbox
                toggler={toggler}
                sources={[img]}
            />
        </>
    );
};

export default Comments;