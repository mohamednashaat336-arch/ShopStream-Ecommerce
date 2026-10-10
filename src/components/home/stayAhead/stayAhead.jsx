import './stayAhead.css'
export function StayAhead(){
    return(
        <>
            <div className='stayA-main'>
                <div>
                    <h1>Stay Ahead of the Stream</h1>
                    <p>Join our inner circle for exclusive early access to product launches, seasonaldeals, and curated tech trends. No spam, just high-quality updates.</p>
                    <div className='pt-5 '>
                        <input className='me-3' type="email" placeholder='Enter your email' />
                        <button>Join Now</button>
                    </div>
                </div>
            </div>
        </>
    )
}