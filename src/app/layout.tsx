import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Antibody — Turn incidents into prevention',description:'Validate a lesson from one incident. Find the pattern elsewhere. Ship a tested prevention check.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
