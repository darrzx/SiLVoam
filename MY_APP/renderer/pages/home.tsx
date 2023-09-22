
import { getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import { auth } from "../utils/db";


export default function Home(){
    //Validasi User Uda Login atau belum
    const user = auth.currentUser;
    useEffect(() => {
        if(user == null){
            localStorage.clear();
            Router.push('/login')
        }
    }, [user])
    
}