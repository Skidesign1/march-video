// 'use client';

// import dynamic from 'next/dynamic'

// const DynmicEditor = dynamic(() => import('../../../components/Editor').then(a => a.EditorWithStore), {
//   ssr: false,
// })


// function EditorPage() {
//   return (
//     <DynmicEditor />
//   );
// }

// EditorPage.diplsayName = "EditorPage";

// export default EditorPage;


"use client"
import React from "react";
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { StoreProvider } from "@/store";
import { StoreContext } from "@/store";
import { Editor } from "../../../components/Editor";


//This error is coming from this file. to look into it later

// - error node_modules\animejs\lib\anime.js (927:0) @ makePromise
// - error ReferenceError: window is not defined
//     at new Store (./src/store/Store.ts:48:81)

function EditorPage() {
  console.log('running tmplt pge')
  const store = React.useContext(StoreContext);

  const params = useParams()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const token = searchParams.get('token')
  if (token) {
    window.sessionStorage.setItem('token', token);
  }
  if (userId) {
    window.sessionStorage.setItem('userId', userId);
  }
  if (params.templateId) {
    window.sessionStorage.setItem('templateId', params.templateId);
  }

  useEffect(() => {
    // const fetchTemplateInfo = async () => {
    //   try {
    //     if(typeof window !== 'undefined'){
    //     const token = window.sessionStorage.getItem('token');

    //     // Check if token exists
    //     if (!token) {
    //       // Handle case where token is not available
    //       console.error('Token not found in session.');
    //       return;
    //     }

    //     // Define request headers with Authorization header containing the token
    //     const config = {
    //       headers: {
    //         Authorization: `${token}`,
    //       },
    //     };
    //     // Make a POST request to fetch template info using the provided id
    //     const response = await axios.get(`https://skyestudio-backend.onrender.com/templates/${params.templateId}`, config);
    //     console.log(response.data)
    //     store?.setTemplateInfo(response.data);
    //    }
    //   } catch (error) {
    //     console.error('Error fetching template info:', error);
    //   }
    // };

    const userId = window.sessionStorage.getItem('userId');
    const fetchUserInfo = async () => {
      try {
        const token = window.sessionStorage.getItem('token');

        // Check if token exists
        if (!token) {
          // Handle case where token is not available
          console.error('Token not found in session.');
          return;
        }

        // Define request headers with Authorization header containing the token
        const config = {
          headers: {
            Authorization: `${token}`,
          },
        };

        // Make a POST request to fetch user info using the provided id
        const response = await axios.get(`https://skyestudio-backend.onrender.com/user/profile`, config);
        console.log(response)
        store?.setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    // if (params.templateId) {
    //   fetchTemplateInfo();
    // }

    if (userId) {
      fetchUserInfo();
    }
  }, [params.templateId, userId]);

  return (
    userId &&
    <StoreProvider>
      <Editor />
    </StoreProvider>
  );
}



export default EditorPage;
