export default function Header ( { league } ) {
    return (
        <>
            <h1>Who WoulDIV Thought? (<span className='capitalized'>{league})</span></h1>
            {league === 'league' && ( <p><a href="/standard">Check Standard</a></p> )}
            {league === 'standard' && ( <p><a href="/league">Check League</a></p> )}
        </>
    );
}