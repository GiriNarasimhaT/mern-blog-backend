import {format} from 'date-fns';
import { Link } from 'react-router-dom';
import API_URL from '../config';

function Post(props) {
    return (
        <Link to={`/post/${props._id}`} className="links">
            <div className="post">
                <div className="image">
                    <img src={`${API_URL}/`+props.cover} alt="" />
                </div>
                <div className="texts">
                    <h2>{props.title}</h2>
                    <p className="info">
                        <Link to={`/viewprofile/${props.author?._id ?? ''}`} className="author links">@{props.author?.username ?? 'Unknown'}</Link>
                        <time>{format(new Date(props.createdAt),'MMM d, yyyy | HH:mm')}</time>
                    </p>
                    <p className="summary">{props.summary}</p>
                </div>
            </div>
        </Link>
     );
}

export default Post;