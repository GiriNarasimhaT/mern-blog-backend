import { useState,useEffect,useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from '../config';
import { UserContext } from '../UserContext';
import Loading from "./Loading";

function EditProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const {id} = useParams();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState(false);
    const { setUserInfo } = useContext(UserContext);

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
        fetch(`${API_URL}/user/${id}`)
          .then((response) => {
            if (response.ok) {
              setIsLoading(false);
              return response.json();
            }
            throw new Error('Invalid User Id');
          })
          .then((data) => {
            setEmail(data.user.email);
            setUsername(data.user.username);
            setBio(data.user.bio);
          })
          .catch((error) => {
            setIsLoading(false);
            console.error(error);
            setRedirect(true);
            setMessage('Invalid User Id');
            setType(true);
          });
      }, []);

    async function updateProfile(e){
        e.preventDefault();
        setIsLoading(true);
        if (!validateusername()) {
          setIsLoading(false);
          return;
        }
        const data = new FormData();
        data.set('id',id);
        data.set('email',email);
        data.set('username',username);
        data.set('bio',bio)
        if (files?.[0]){
            data.set('file',files?.[0]);
        }

        const response = await fetch(`${API_URL}/profile`,{
            method:'PUT',
            body: data,
            credentials: 'include',
        }); 

        if (response.ok){
            response.json().then(userInfo => {  //increases response time
                setUserInfo(userInfo);
            });
            setIsLoading(false);
            setRedirect(true);
            setMessage("Profile Updated Successfully");
            setType(true);
        }
        else{
            setIsLoading(false);
            setMessage("Profile Update Failed");
            setType(false);
        }
    }

    function validateusername() {
        if (!username.trim()) {
          setMessage("Please enter your username");
          setType(false);
        } else if (!/^[A-Za-z]/.test(username)) {
          setMessage("Username must start with a letter");
          setType(false);
        }else if (username.length < 8) {
          setMessage("Username must be at least 8 characters long");
          setType(false);
        } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(username)) {
          setMessage("Only letters, numbers and underscores are allowed");
          setType(false);
        } else{
            return true;
        }
    }

    if (isLoading) {
        return <Loading />;
    }

    if (redirect){
        return <Navigate to={'/viewprofile/'+id}/> //reloads component alone
        // window.location.href = "/viewprofile/"+id; //reloads header also
    }

    return ( 
        <>
            <form onSubmit={updateProfile} className="editprofile-form">
                <input type="file" onChange={e=>setFiles(e.target.files)}/>
                <input type="text" placeholder="Full Name" value={username} onChange={e=>setUsername(e.target.value)}/>
                <input type="text" placeholder="Bio" value={bio} onChange={e=>setBio(e.target.value)}/>
                <input type="text" value={email} disabled readOnly/>
                <button style={{marginTop:'10px'}} className="update-btn">Update Profile</button>
            </form>
        </>
     );
}

export default EditProfile;