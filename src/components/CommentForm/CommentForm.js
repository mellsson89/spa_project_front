import React, {useState, useEffect,useContext,useRef} from 'react';
import {Context} from "../../context";
import {TextField, Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {addComment, uploadImg, uploadFile} from "../../service/api-service";
import {socket} from "../../lib/socket";
import styled from './styled/comment.module.scss';
import { useForm } from "react-hook-form";
import {isEmail} from "validator";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Avatar from "@mui/material/Avatar";
import AttachmentIcon from "@mui/icons-material/Attachment";
import PhotoIcon from "@mui/icons-material/Photo";
import FsLightbox from "fslightbox-react";
import LinkIcon from "@mui/icons-material/Link";
import moment from "moment-timezone";
import {AvatarGenerator}  from 'random-avatar-generator';
import ModalFile from "../ModalFile";
import TagPanel from "../TagPanel";



const CommentForm = ({onClose, parentId = null, prevText}) => {

    const {page,limit,sort, key} = useContext(Context);
    const options = {page,limit,sort, key};


    const [toggle, setToggle] = useState(false);
    const [comment, setComment] = useState('');
    const [toggler, setToggler] = useState(false);
    const [urlImg, setUrlImg] = useState('');
    const [urlFile, setUrlFile] = useState('');
    const [showModalFile, setShowModalFile] = useState(false);
    const [errorTags, setErrorTags] = useState(null);

    const{name:nameWatch='',email:emailWatch='', text:textWatch='', homepage, upload='', captcha:captchaWatch} = comment;

        const imgWatch = upload[0]?.type.split('/')[0] === 'image' ? true : false;
        const fileWatch = upload[0]?.type.split('/')[0] === 'text' ? true : false;

    const { register, handleSubmit, watch, formState: { errors }, control} = useForm({
        mode: "onBlur",
        defaultValues:{
            homepage:null
        }
    });


    useEffect( () => {
        loadCaptchaEnginge(4);
    },[]);


    useEffect(() => {
        const subscription = watch((data) => setComment(data));
        return () => subscription.unsubscribe();
    }, [watch]);

    const togglePrevView = () => {
        setToggle(!toggle)
    }

    const toggleModalFile = () => {
        setShowModalFile(!showModalFile)
    }

    const list = () => {

        if(imgWatch) {
            const reader = new FileReader();
            reader.readAsDataURL(upload[0]);
            reader.onloadend = function () {
             setUrlImg(reader.result)
            }

            reader.onerror = () => {
                console.log(reader.error)
            }
        }

        if(fileWatch) {
            const reader = new FileReader();
            reader.readAsText(upload[0]);
            reader.onload = () => {
                setUrlFile(reader.result);
            }

            reader.onerror = () => {
                console.log(reader.error)
            }
        }

        const dateTime = moment.utc().format('DD.MM.YYYY HH:mm')
        const [date, time] = dateTime.split(' ');


        const generator = new AvatarGenerator();
        const avatar = generator.generateRandomAvatar();

          return (
              <Box
                  sx={{ width: 'auto', marginLeft:'100px', marginRight:'100px', marginTop:'30px'}}
                  role="presentation"
                  onKeyDown={togglePrevView}
              >
                  <div>
                      <div className={styled.header_comment}>
                          {avatar && <Avatar alt="Avatar" src={avatar} />}
                          <p className={styled.name}>{nameWatch}</p>
                          <p className={styled.date}>{`${date} в ${time}`}</p>
                          {fileWatch && <AttachmentIcon fontSize="small" sx={{cursor:'pointer', marginRight: homepage ? '10px' : 0}} onClick={() => setShowModalFile(!showModalFile)}/>}
                          {showModalFile && fileWatch && <ModalFile onClose={toggleModalFile}><p>{urlFile}</p></ModalFile>}
                          {imgWatch && <PhotoIcon fontSize="small" sx={{cursor:'pointer', marginRight: homepage ? '10px' : 0}}  onClick={() => setToggler(!toggler)}/>}
                          { imgWatch && <FsLightbox
                              toggler={toggler}
                              sources={[
                                  <img src={urlImg} alt="Image" width='320'/>
                              ]}
                          />}
                          {homepage && <a href={homepage} title='Home Page' target='_blank'><LinkIcon fontSize="small"/></a> }
                      </div>
                      <div className={styled.text}>
                          <p>{textWatch}</p>
                      </div>
                  </div>
              </Box>
          )

    }






    const onSubmit =  async (data) => {

        const {name,email, homepage, text, upload} = data;

        if(upload.length === 0) {
            const comment = {
                    name,
                    email,
                    home_page:homepage,
                    text,
                    prevText,
                    parentId
                }


                await addComment(comment);
            socket.emit('add-comment', options);
            onClose();

        }

        if(upload.length > 0) {

            const file = upload[0];
            if(file.type === 'text/plain') {

                const formData = new FormData();
                formData.append('uploadFile', file);
                const {data:{urlFile}} = await uploadFile(formData);

                if(urlFile) {
                    const comment = {
                        name,
                        email,
                        home_page:homepage,
                        text,
                        prevText,
                        url_file:urlFile,
                        parentId
                    }

                     await addComment(comment);
                    socket.emit('add-comment', options);
                    onClose();

                }
            }

            if(file.type === 'image/gif' || file.type === 'image/jpeg' || file.type === 'image/png') {

                const formData = new FormData();
                formData.append('uploadImg', file);
                const {data:{urlImg}} = await uploadImg(formData);

                if(urlImg) {
                    const comment = {
                        name,
                        email,
                        home_page:homepage,
                        text,
                        prevText,
                        url_file:urlImg,
                        parentId
                    }

                    await addComment(comment);
                    socket.emit('add-comment', options);
                    onClose();

                }

            }


        }

    }

    const valid =(input) => {
        const file = input[0];

        if(file?.type === 'text/plain' && file?.size > 100000) {
            return false;
        }

    }

    const validTag = (str) => {

        const regex = /<(code|a|i|strong)(?:\s[^>]*)?>|<\/(code|a|i|strong)>/gi;
        const regexBlack = /^(?!.*<(?!\/?(code|a|i|strong|a\s+href=""\s+title="">)))[^\n]*<\/?(code|a|i|strong|a\s+href=""\s+title="">)[^\n]*$/gi;

        const openTags = str.match(regex);
        const blackTag = regexBlack.test(str);


        if (openTags === null) {
            setErrorTags(null)
            return true;
        }

        if(!blackTag) {
            setErrorTags('This tag is prohibited!!!')
            return false;
        }


        if (openTags && openTags.length % 2 === 0) {
            setErrorTags(null);
            return true;

        } else {
            setErrorTags('There are not closed tags!!!')
            return false;

        }
    }


    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}  className={styled.form}>
                <TextField
                    required
                    error={!!errors.name}
                    helperText={errors?.name?.type}
                    {...register("name", {required:true, minLength: 4, pattern: /^[A-Za-z0-9]+$/i

                    }) }
                    sx={{'&.MuiFormControl-root' : {
                    marginBottom:'20px'
                    }
                    }}
                    id="outlined-basic"
                    label="Name"
                    name='name'
                    variant="outlined" />
                <TextField
                    required
                    error={!!errors.email}
                    helperText={errors?.email?.type}
                    {...register("email", {required:true, validate:(input) => isEmail(input)})}
                    sx={{'&.MuiFormControl-root' : {
                            marginBottom:'20px'
                        }
                    }}
                    id="outlined-basic"
                    label="Email"
                    name='email'
                    variant="outlined" />


                <input type="file" name='upload' accept='image/jpeg, image/png, image/gif, text/plain' {...register("upload",{validate:(input) => valid(input)} ) }/>
                {errors.upload &&  <p>File too large</p>}
                <TextField
                    error={!!errors.homepage}
                    helperText={errors?.homepage?.type}
                    {...register("homepage", {pattern:/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g})}
                    sx={{'&.MuiFormControl-root' : {
                            marginBottom:'20px',
                            marginTop: '20px'
                        }
                    }}
                    id="outlined-basic"
                    label="Homepage"
                    name='homepage'
                    variant="outlined" />

                <TagPanel id='text' />
                <TextField
                    required
                    error={!!errors.text}
                    helperText={errors?.text?.type === 'validate' ? errorTags : errors?.text?.type }
                    {...register("text", {required:true, validate:(input) => validTag(input)}) }
                    sx={{'&.MuiFormControl-root' : {
                            marginBottom:'20px'
                        }
                    }}
                    label="Text"
                    name='text'
                    multiline
                    rows={4}
                    variant="outlined"
                    id='text'
                />

                <LoadCanvasTemplate style={{}} reloadText="Reload My Captcha" reloadColor="#1976d2" />
                <TextField
                    required
                    error={!!errors.capcha}
                    helperText={errors?.capcha?.type}
                    {...register("captcha", {required:true, validate:(input) => validateCaptcha(input)})}
                    sx={{'&.MuiFormControl-root' : {
                        marginTop:'10px',
                            marginBottom:'20px'
                        }
                    }}
                    id="outlined-basic"
                    label="Captcha"
                    name='captcha'
                    variant="outlined" />

                <div style={{textAlign:'center'}}>
                    <Button onClick={togglePrevView} disabled={!nameWatch || !textWatch || !emailWatch}>Предпросмотр</Button>
                    <Button variant="contained" type='submit' endIcon={<SendIcon /> } disabled={Object.keys(errors).length > 0 || !nameWatch || !textWatch || !emailWatch || !captchaWatch ? true : false}>
                        Добавить комментарий
                    </Button>
                    <Drawer
                        anchor='top'
                        open={toggle}
                        onClose={togglePrevView}
                    >
                        {list()}
                    </Drawer>
                </div>
            </form>
        </div>
    );
};

export default CommentForm;