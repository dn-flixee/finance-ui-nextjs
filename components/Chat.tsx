import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const chat = () => {

    return(
        <>
        <div className="m-5 absolute bottom-0 right-0  ..."> 
          <Drawer>
            <DrawerTrigger>
            <Button>Finance AI</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
              <iframe src="http://localhost:8501" width="100%" height="500" title="finance ai"></iframe>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
            </Drawer>

            
          </div>
        </>
    )
}

export default chat
    