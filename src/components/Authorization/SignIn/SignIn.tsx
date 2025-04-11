import './SignIn.scss';

interface SignInProps {
  onSetAuthStep: (step: "info" | "form") => void
  onSetName: (name: string) => void
}

export const SignIn: React.FC<SignInProps> = ({ onSetAuthStep, onSetName }) => {


  return (
    <div className='signIn-container'>
      <div className='inner-wrap'>
        <h1 className='signIn__title'>Please enter the name or nickname you want other members to see you by</h1>
        <input className='signIn__input' placeholder='name, login, nickname ...' onChange={(event) => onSetName(event.target.value)}></input>
        <button className='signIn__button' onClick={() => onSetAuthStep('info')}>SIGN IN</button>
      </div>

    </div>
  );
}