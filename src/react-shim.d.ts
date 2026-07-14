declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}

declare module 'react/jsx-dev-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}

declare module 'react-router-dom' {
  export function BrowserRouter(props: any): any;
  export function Routes(props: any): any;
  export function Route(props: any): any;
  export function Link(props: any): any;
  export function NavLink(props: any): any;
  export function Navigate(props: any): any;
  export function useNavigate(): any;
  export function useParams(): any;
}
