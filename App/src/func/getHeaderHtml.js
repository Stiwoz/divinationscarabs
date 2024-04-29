import { useLocation } from 'react-router-dom';

export default function getHeaderHtml () {
    const { pathname } = useLocation();
    return (
        <header>
            <h1>Who WoulDIV Thought?</h1>
            <h2>{pathname.replace('/', '')}</h2>
            {pathname === '/league' && ( <p><a href="/standard">Check Standard</a></p> )}
            {pathname === '/standard' && ( <p><a href="/league">Check League</a></p> )}
        </header>
    );
}
