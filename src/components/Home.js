import Post from "./Post";
import { useEffect,useState } from "react";
import Loading from "./Loading";
import API_URL from "../config";

function Home() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetch(`${API_URL}/posts`,{
            headers: {
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
            },
        }).then(response=>{
            response.json().then(posts=>{
                setIsLoading(false);
                setPosts(posts);
            });
        });
    }, []);
    
    return (
        <>
            {isLoading ? <Loading/> : 
                <div className="post-container">
                    {posts.length > 0 &&  posts.map(post =>(
                        <Post key={post._id} {...post}/>
                    ))}
                    {posts.length === 0 &&  
                        <>
                            <h1>Welcome to Mern Blog App</h1>
                            <img src="https://img.freepik.com/free-vector/hand-drawn-man-working-from-home_23-2148818123.jpg?w=740&t=st=1676899883~exp=1676900483~hmac=0e2f2096a6575ec3f955668dcc5c5ba0b542f047a5c2747ccdd81194d5bd6fdd" alt="" className="empty-home-img"/>
                            <h3 className="no-post-text">Start Creating Posts</h3>
                        </>
                    }
                </div>
            }
        </>
    );
}

export default Home;