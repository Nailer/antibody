import {NextRequest,NextResponse} from 'next/server';
export function proxy(req:NextRequest){
 const origin=req.headers.get('origin');
 if(req.method!=='GET'&&req.method!=='HEAD'&&origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Cross-origin requests are not permitted.'},{status:403});
 const token=process.env.ACCESS_TOKEN;
 if(token){const auth=req.headers.get('authorization');const expected='Basic '+btoa('antibody:'+token);if(auth!==expected)return new NextResponse('Authentication required',{status:401,headers:{'WWW-Authenticate':'Basic realm="Antibody workspace", charset="UTF-8"'}});}
 return NextResponse.next();
}
export const config={matcher:['/app/:path*','/api/:path*']};
