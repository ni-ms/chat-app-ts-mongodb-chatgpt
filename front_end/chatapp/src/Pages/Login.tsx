import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    MDBBtn,
    MDBCheckbox,
    MDBContainer,
    MDBInput,
    MDBTabs,
    MDBTabsContent,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane
} from 'mdb-react-ui-kit';

function Login() {

    const [basicActive, setBasicActive] = useState('tab1');
    const navigate = useNavigate();
    const handleBasicClick = (value: string) => {
        if (value === basicActive) {
            return;
        }

        setBasicActive(value);
    };
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleRegister = async () => {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        });

        const data = await response.json();
        console.log(data);
    };
    const handleLogin = async () => {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            if (data.token) {
                sessionStorage.setItem('tokenVal', data.token);
                sessionStorage.setItem('emailVal', email);
                //wait for 2 seconds
                setTimeout(() => {
                    navigate(`/Chat`);
                }, 1000);

            } else {
                console.error('Key is empty');
            }
        } else {
            console.error('Response is not ok');
        }

    };

    return (
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50">

            <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleBasicClick('tab1')} active={basicActive === 'tab1'}>
                        Login
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleBasicClick('tab2')} active={basicActive === 'tab2'}>
                        Register
                    </MDBTabsLink>
                </MDBTabsItem>
            </MDBTabs>

            <MDBTabsContent>

                <MDBTabsPane open={basicActive === 'tab1'}>

                    <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email' value={email}
                              onChange={(e) => setEmail(e.target.value)}/>
                    <MDBInput wrapperClass='mb-4' label='Password' id='form2' type='password' value={password}
                              onChange={(e) => setPassword(e.target.value)}/>

                    <div className="d-flex justify-content-between mx-4 mb-4">
                        <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me'/>
                    </div>

                    <MDBBtn className="mb-4 w-100" onClick={handleLogin}>Sign in</MDBBtn>
                    <p className="text-center">Not a member? <a onClick={() => handleBasicClick('tab2')}>Register</a>
                    </p>

                </MDBTabsPane>

                <MDBTabsPane open={basicActive === 'tab2'}>
                    <MDBInput wrapperClass='mb-4' label='Email' id='form1' type='email' value={email}
                              onChange={(e) => setEmail(e.target.value)}/>
                    <MDBInput wrapperClass='mb-4' label='Password' id='form1' type='password' value={password}
                              onChange={(e) => setPassword(e.target.value)}/>
                    <div className='d-flex justify-content-center mb-4'>
                        <MDBCheckbox name='flexCheck' id='flexCheckDefault' label='I have read and agree to the terms'/>
                    </div>

                    <MDBBtn className="mb-4 w-100" onClick={handleRegister}>Sign up</MDBBtn>

                </MDBTabsPane>

            </MDBTabsContent>

        </MDBContainer>
    );
}

export default Login;