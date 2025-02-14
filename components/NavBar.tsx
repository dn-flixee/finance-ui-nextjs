import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import {auth} from "@/auth"
import { Button } from "./ui/button"
import { handleSignOut } from "@/app/actions/authActions"

 function NavBar() {
  
  const {data: session} = useSession();
  console.log("session")
  console.log(session)
  console.log("session")

  return (
    <header className="bg-green-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
          </svg>
          <h1 className="text-xl font-bold">HOME</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={session?.user?.image} alt="@username" />
            <AvatarFallback>{session?.user?.name}</AvatarFallback>
          </Avatar>
          <span>{session?.user?.name}</span>
          <form action={handleSignOut}>
          <Button variant="default" type="submit">Sign Out</Button>
          </form>
        </div>
      </header>
  )
}
export default NavBar