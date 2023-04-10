import React, { useEffect, useState} from "react";
import Comments from "./components/Comments";
import {getAllComments} from "./service/api-service";
import {Button} from '@mui/material';
import Modal from "./components/Modal";
import CommentForm from "./components/CommentForm";
import {socket} from "./lib/socket";
import styled from './styled/app.module.scss';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import {Context} from "./context";

function App() {

    const [comments, setComments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [nbPages, setNbPages] = useState(null);
    const [nbComments, setNbComments] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [sort, setSort] = useState('DESC');
    const [key, setKey] = useState('createdAt');


    socket.on("connect", () => {
        console.log('Hello')
    });

    const handlerKey = async (e) => {
        const value = e.target.value;
        setKey(value);
    }

    const handlerSort = (e) => {
        const value = e.target.value;
        setSort(value);
    }


    const toggleModal = () => {
        setShowModal(!showModal);
    }


    useEffect( () => {
        (async function () {
            const {data} = await getAllComments(page,limit,key,sort);
            const {comments,nbPages, nbComments} = data;
            setNbPages(nbPages);
            setNbComments(nbComments);
            setComments(comments);
        })()
    }, [key,limit,page,sort]);



    useEffect(() => {
        socket.on('get-comment', (data) => {
            setComments(data)
        })
    }, []);



  return (
      <Context.Provider value={{
          page,limit,sort,key
      }}>
      <div className={styled.container}>
          <Button sx={{marginTop:'30px'}} variant="contained" onClick={toggleModal}>Добавить комментарий</Button>
        <div >
            <Box sx={{ textAlign:'right', marginBottom:'10px'}}>
                <FormControl>
                    <InputLabel variant="standard" />

                    <NativeSelect value={key} onChange={handlerKey}>
                        <option value={'name'}>Имя</option>
                        <option value={'email'}>E-mail</option>
                        <option value={'createdAt'}>Дата добавления</option>
                    </NativeSelect>
                </FormControl>
                <FormControl sx={{marginLeft:'10px'}}>
                    <InputLabel variant="standard" />
                    <NativeSelect value={sort} onChange={handlerSort}>
                        <option value={'ASC'} >По возростанию</option>
                        <option value={'DESC'}>По убиванию</option>
                    </NativeSelect>
                </FormControl>
            </Box>
            <Comments comments={comments}/>
            { nbPages > 1 && <Pagination
                count={nbPages}
                page={page}
                sx={{marginY:'30px', justifyContent:'center', display:'flex'}}
                onChange={(_,num) => setPage(num) }/>}
        </div>
          {showModal && <Modal onClose={toggleModal}><CommentForm  onClose={toggleModal} /></Modal>}
      </div>
      </Context.Provider>
  );
}

export default App;
