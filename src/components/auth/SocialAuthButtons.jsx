import { FaApple } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export function SocialAuthButtons({ action = 'continue' }) {
  const divider = action === 'register' ? 'Or register with' : 'Or continue with'
  return <div className="auth-social-area">
    <div className="auth-social-divider"><span>{divider}</span></div>
    <div className="auth-social-buttons">
      <button type="button" aria-label="Google sign in is not available"><FcGoogle aria-hidden="true" /><span>Google</span></button>
      <button type="button" aria-label="Apple sign in is not available"><FaApple aria-hidden="true" /><span>Apple</span></button>
    </div>
  </div>
}
