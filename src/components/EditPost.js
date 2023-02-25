import { useState,useEffect,useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Editor from './Editor';
import API_URL from '../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from "../UserContext";
import Loading from "./Loading";

function EditPost() {
    const [isLoading, setIsLoading] = useState(true);
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState(false);
    const {userInfo} = useContext(UserContext);

    useEffect(() => {
        if (message){
            if (type)
            toast.success(message);
            else{
            toast.error(message);
            }
            setMessage('');
        }
    }, [message]);

    useEffect(() => {
        fetch(`${API_URL}/post/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Post not found');
                }
                return response.json();
            })
            .then(postData => {
                setIsLoading(false);
                setTitle(postData.title);
                setSummary(postData.summary);
                setContent(postData.content);
            })
            .catch(error => {
                console.error(error);
                setRedirect(true);
                setMessage("Invalid Post Id");
                setType(false);
            });
    }, []);

    async function updatePost(e){
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData();
        data.set('id',id);
        data.set('title',title);
        data.set('summary',summary);
        data.set('content',content);
        if (files?.[0]){
            data.set('file',files?.[0]);
        }

        const response = await fetch(`${API_URL}/post`,{
            method:'PUT',
            body: data,
            credentials: 'include',
        });

        if (response.ok){
            setIsLoading(false);
            setRedirect(true);
            setMessage("Post Updated Successfully");
            setType(true);
        }
        else{
            setIsLoading(false);
            setMessage("Post Update Failed");
            setType(false);
        }
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!userInfo){
        return <Navigate to={'/post/'+id}/>
    }

    if (redirect){
        return <Navigate to={'/post/'+id}/>
    }

    return ( 
        <>
            <form onSubmit={updatePost} className="editpost-form">
                <input type="text" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/>
                <input type="text" placeholder="Summary" value={summary} onChange={e=>setSummary(e.target.value)}/>
                <input type="file" onChange={e=>setFiles(e.target.files)}/>
                <Editor value={content} onChange={setContent}/>
                <button style={{marginTop:'10px'}} className="update-btn">Update Post</button>
            </form>
        </>
     );
}

export default EditPost;