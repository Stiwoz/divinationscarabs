import { useLocation } from 'react-router-dom';

export default function getHeaderHtml () {
    const { pathname } = useLocation();
    return (
        <header>
            <h1>Who WoulDIV Thought? (<span className='capitalized'>{pathname.replace('/', '')})</span></h1>
            {pathname === '/league' && ( <p><a href="/standard">Check Standard</a></p> )}
            {pathname === '/standard' && ( <p><a href="/league">Check League</a></p> )}
        </header>
    );
}
