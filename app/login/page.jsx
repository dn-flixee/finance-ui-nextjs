import React from "react";
import { IoMail } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import Image from 'next/image';
import Link from 'next/link';

const page = () => {
  return (
    
    <div className="bg-[#e0e1dd] flex flex-col sm:flex-row justify-center w-screen h-screen">
      <div className="basis-1/2 bg-[#69995D] flex flex-col justify-center items-center">
        <div className="w-1/3 pb-4">
                <Image src="/logo.png" alt="logo" width={100} height={100}/>
          </div>
          <div>
            <p className="text-3xl text-white [font-family:'Inter-SemiBold',Helvetica] font-semibold whitespace-nowrap">
                Finance Tracker
            </p>
          </div>
      </div>
      
      <div className="basis-1/2 bg-[#D3D3D3] flex flex-col justify-center items-center">
        <div className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-black text-3xl pb-3">Welcome
        </div>
        <div  className="relative w-64">
            <input type="name" id="name" className="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-64 h-12 p-2 m-2" placeholder="Name" required />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FaUserCircle className="text-gray-500" />
            </span>
        </div>
        <div  className="relative w-64">
            <input type="email" id="email" className="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-64 h-12 p-2 m-2" placeholder="name@example.com" required />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <IoMail className="text-gray-500" />
            </span>
        </div>
        <div>
            <button type="button" id="login" className="bg-[#232323]  border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 h-12 ml-3 mt-10 text-white" required>Login</button>
          </div>
          <div className=" mb-2 text-xs p-3" >
            <p>
              <span className="  text-gray-500">Don’t have an account yet? </span>
              <span className="  text-gray-800" > 
              <Link href="/signup"> Sign Up</Link>
              </span>
            </p>
          </div>
      </div>
      
    </div>
  )
}
export default page