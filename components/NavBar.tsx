import Image from "next/image"

const NavBar = () => {
  return (
    <div className=" bg-green-500 flex flex-row">
  <div className="flex-1 p-2">
    <a className="normal-case text-xl"><Image src="/logo.png" alt="log" width={30} height={30}/></a>
  </div>
  <div className="flex flex-row p-2">
        <div className="avatar">
        <div className="w-8 rounded-full">
          <Image src="/user_icon.png" alt="user logo" width={30} height={30} />
        </div>
        </div>
          flixee
          <svg className="fill-current " xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
  </div>
  </div>
  )
}

export default NavBar