import React, { useEffect, useState } from 'react';
import { FormInterface } from "../interfaces/FormInterface"
import "../styles/Login.css"
import "../styles/RegisterForm.css"
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import ChangeImgPath from './ImageUpload';
import { authCookie } from '../App';

interface Props {
	handle_change_name: any;
}

const RegisterForm: React.FC<Props> = ({ handle_change_name }: Props): JSX.Element => {
	const [url, setUrl] = useState<string>("");
	const [login, setLogin] = useState<string>("");
	const [ft_email, setFtEmail] = useState<string>("");
	const [errorLogin, setErrorLogin] = useState<boolean>(false);
	const [errorEmail, setErrorEmail] = useState<boolean>(false);
	const [errorTooLong, setErrorTooLong] = useState<boolean>(false);
	const [goneThroughLogin, setGoneThroughLogin] = useState<boolean>(true);
	const navigate = useNavigate();

	const handleImageUpload = (uploadPath: string): any => {
		setUrl(uploadPath);
	}

	if (authCookie.get('42auth-cookie') !== undefined) {
		axios.defaults.headers.common['Authorization'] = authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id;
	}

	const handleInfo = (e: React.SyntheticEvent): void => {
		e.preventDefault();
		const target = e.target as typeof e.target & {
			username: { value: string };
			email: { value: string };
			image_url: { value: string };
		};
		let username = "";
		if (target.username.value)
			username = target.username.value;
		let email = "";
		if (target.email.value)
			email = target.email.value;
		let image_url = "";
		if (target.image_url && target.image_url.value)
			image_url = target.image_url.value;
		if (!username)
			username = login;
		if (!email)
			email = ft_email;
		if (!image_url)
			image_url = url;

		fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/signup", {
			mode: 'cors',
			method: 'POST',
			credentials: 'include', //////// Needed to create cookie
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Authorization':authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id 

			},
			body: JSON.stringify({
				"email": email,
				"login": username,
				"image_url": image_url,
				"password": "not_null",
			}),
		})
		.then(response => {
			if (response.ok) {
				setErrorEmail(false);
				handle_change_name(username);
				navigate('/Home')
				return;
			} else {
				setErrorEmail(true);
				throw new Error('Something went wrong...');
			}
		})
		.catch(error => console.log(error));
	}

	const ModifyData = (e: React.ChangeEvent<HTMLInputElement>): void => {
		e.preventDefault();
		if (e.target.value.length && e.target.value !== login) {
			axios
			.get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user_by_login/" + e.target.value)
			.then((response) => {
				if (response.data.login === e.target.value) {
					setErrorLogin(true);
					throw new Error('Something went wrong: login already exists...');
				}
				else if (e.target.value.length > 8)
				{
					setErrorTooLong(true);
					throw new Error('Something went wrong: login cannot exceed 8 characters');

				}
					else {
						setErrorLogin(false);
						setErrorTooLong(false);
						return;
					}
				})
				.catch((reason: any) => { console.error("Could not get user by login") });
		} else {
			setErrorLogin(false);
			setErrorTooLong(false);
		}
		setUserInfo((old => {
			const tmp: FormInterface = {
				username: e.target.name === "username" ? e.target.value : old.username,
				email: e.target.name === "email" ? e.target.value : old.email,
				image_url: e.target.name === "image_url" ? e.target.value : old.image_url,
			}
			return tmp;
		}))
	}

	const [userInfo, setUserInfo] = useState<FormInterface>({
		username: "",
		email: "",
		image_url: ""
	})

	useEffect(() => {
		let data;
		if (authCookie.get('42auth-cookie'))
			data = {
				headers: { Authorization: authCookie.get('42auth-cookie').token + '||' + authCookie.get('42auth-cookie').id }
			}
		else
			data = {
				headers: { Authorization: '' }
			}

		axios
			.get("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/get_user", {
				data //is empty because user logs for the first time
			})
			.then((response) => {
				setUrl(response.data.image_url);
				setLogin(response.data.login);
				setFtEmail(response.data.email);
				if (response.data === -1 || response.data.gone_through_register) {
					setGoneThroughLogin(false);
				}
			})
			.catch((e) => {
				console.error(e)
				console.error("Could not get user");
				setGoneThroughLogin(false);
			});
	}, [goneThroughLogin]);

	const clearErrors = (e: React.SyntheticEvent): void => {
        setErrorEmail(false);
    }

	if (goneThroughLogin) {				// render register form only if user has clicked on Login (meaning OAuth has been done)
		return (
			<div className="form-overlay">
			<form onSubmit={(e: React.SyntheticEvent) => { handleInfo(e); }}>
			<h1 className="form-title">Update your information</h1>

				<label className='label'>Your avatar</label>
				<br></br>
				<div className="div_profilepic">
					<img className="profilepic" src={url} alt="Current avatar" width={100} height={100} />
				</div>
				<br></br>
				<ChangeImgPath handleImageUpload={handleImageUpload} /> <></>
				<br></br>

				<label className='label'>Your username</label>
				<input
					className='input_register_form'
					type="text"
					name="username"
					placeholder={login}
					onChange={ModifyData}
					/>
				<br></br>
				<b className="error" >{errorLogin ? "This login is already taken." : ""}</b>
				<b className="error" >{errorTooLong ? "This login cannot exceed 8 characters." : ""}</b>
				<br></br>
				
				<label className='label'>Your email address</label>
				<input
					className='input_register_form'
					name="email"
					placeholder={ft_email}
					type="email"
					onFocus={clearErrors}
					/>
				<br></br>
				<b className="error" >{errorEmail ? "This email address is already taken." : ""}</b>
				<br></br>

				<button disabled={errorLogin || errorTooLong} className="btn" type="submit">
					Submit
				</button>
			</form>
			</div>
		);
	} else {
		return (
			<main className="font__game">
				<Navigate to="/Login" replace={true} />
			</main>
		);
	}
};

export default RegisterForm;
