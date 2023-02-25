import { Link, useParams,Navigate } from "react-router-dom";
import { useEffect,useState,useContext } from "react";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Loading from "./Loading";
import PageNotFound from './PageNotFound';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from "../config";

function ViewPost() {
    const [isLoading, setIsLoading] = useState(true);
    const [postdata, setPostdata] = useState(null);
    const {userInfo} = useContext(UserContext);

    const [message, setMessage] = useState('');
    const [type, setType] = useState(false);

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
    
    const {id} = useParams();
    useEffect(() => {
        fetch(`${API_URL}/post/${id}`).then(response=>{
            response.json().then(postdata=>{
                setIsLoading(false);
                setPostdata(postdata);
            });
        }); 
    },[id]);

    // Delete post
    const [redirect, setRedirect] = useState(false);
    async function deletePost(e){
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData();
        data.set('id',id);

        const response = await fetch(`${API_URL}/delete`,{
            method:'DELETE',
            body: data,
            credentials: 'include',
        });

        if (response.ok){
            setIsLoading(false);
            setRedirect(true);
            setMessage("Post Deleted Successfully");
            setType(true);
        }
        else{
            setIsLoading(false);
            setMessage("Post Delete Failed");
            setType(false);
        }
    }

    if (redirect){
        return <Navigate to={'/'}/>
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!postdata.title) return (<PageNotFound/>);

    return (
                <div className="viewpost">
                    <h1>{postdata.title}</h1>
                    <div className="author-row">{
                        <Link to={`/viewprofile/${postdata.author?._id ?? ''}`} className="author">
                            @{postdata.author?.username ?? 'Unknown'}
                        </Link>
                    } | <time>{formatISO9075(new Date(postdata.createdAt))}</time>
                    </div>
                    {userInfo?.id===postdata.author?._id && postdata.author?._id && (
                        <div className="edit-row">
                            <Link className="edit-btn links" to={`/edit/${postdata._id}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                                Edit Post
                            </Link>
                            <Popup trigger={
                                    <button className="delete-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                        Delete Post
                                    </button>
                                }
                                modal={true}
                                closeOnDocumentClick
                                className="popup-card"
                            >
                                <div className="popup-items">
                                    <h3>Are you sure, you want to delete?</h3>
                                    <button style={{marginTop:'10px'}} onClick={deletePost}>Delete</button>
                                </div>
                            </Popup>
                        </div>
                    )}
                    <div className="postcover">
                        <img src={`${API_URL}/${postdata.cover}`} alt="" />
                    </div>
                    <h5>{postdata.summary}</h5>
                    <div className="content" dangerouslySetInnerHTML={{__html:postdata.content}}/>
                </div>
            );
}

export default ViewPost;