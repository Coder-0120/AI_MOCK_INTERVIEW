import axios from 'axios'
import React, { useEffect, useState } from 'react'

const History = () => {
    const[history,setHistory]=useState([]);
    const token = localStorage.getItem("token");

    
    useEffect(()=>{
        const fetchHistory=async()=>{
            try{
                const res=await axios.get("http://localhost:5000/api/auth/history",
                     {
                        headers: {
                        Authorization: `Bearer ${token}`
                        }
                    }
                );
                // console.log(res.data.history);
                setHistory(res.data.history);
            }
            catch(err){
                console.log(err);
            }
        }
        fetchHistory();
    },[])
  return (
    <>
        {history.length === 0 && <p>No interviews found</p>}
        {history.map((item,index)=>(
            <div key={index} style={{color:"white",backgroundColor:'green'}}>
                <p>Role : {item.role}</p>
                <p><b>Date:</b>{" "}{new Date(item.createdAt).toLocaleString()}</p>
                <details>
                    <summary>View Q&A</summary>
                    {item.questions.map((q,i)=>(
                        <div key={i} style={{marginBottom:"10px"}}>
                            <p><b>Q{i+1}:</b>{q}</p> 
                            <p><b>A{i+1}:</b>{item.answers[i]}</p> 
                        </div>
                    ))}
                </details>
                <details>
                    <summary>View Feedback</summary>
                <p>feedback:{item.feedback}</p>
                </details>
                <p>Score:{item.score}</p>

            </div>
        ))}

    </>
  )
}

export default History