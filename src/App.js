import Layout from "./components/Layout";
import Home from "./components/Home";
import {Route, Routes} from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import { UserContextProvider } from './UserContext';
import NewPost from './components/NewPost';
import ViewPost from './components/ViewPost';
import EditPost from './components/EditPost';
import PageNotFound from './components/PageNotFound';
import ViewProfile from "./components/ViewProfile";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path='/' element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/register' element={<Register/>} ></Route>
          <Route path='/newpost' element={<NewPost/>}></Route>
          <Route path='/post/:id' element={<ViewPost/>}></Route>
          <Route path='/edit/:id' element={<EditPost/>}></Route>
          <Route path='/viewprofile/:id' element={<ViewProfile/>}></Route>
          <Route path='/editprofile/:id' element={<EditProfile/>}></Route>
          <Route path="*" element={<PageNotFound/>} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;