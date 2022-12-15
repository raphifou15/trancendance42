import React from "react";
import axios from 'axios';
import { authCookie } from "../App";

interface Props {
	handleImageUpload: any;
}

const ChangeImgPath: React.FC<Props> = ({ handleImageUpload }: Props): any => {

	const upload = async (files: FileList | null) => {
		if (files === null)
			return;
		const formData = new FormData();
		formData.append('file', files[0]);
		const { data } = await axios.post("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/uploads", formData);
		const path = data.url;
		handleImageUpload(path);
		if (authCookie.get('42auth-cookie')) {
			const id = authCookie.get('42auth-cookie').id;
			fetch("http://" + process.env.REACT_APP_HOST_ADDRESS + ":3000/auth/change_image_url_from_profile", {
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
					"id": String(id),
					"image_url": data.url,
					"login": ""
				}),
			})
				.then(response => response.json())
				.then(jsonResponse => console.log('Success: image uploaded'))
				.catch(error => console.log('Error: ', error));
		}
		return;
	}

	return (
		<div>
			<label className="upload-btn">
				Upload new avatar
				<input
					placeholder="upload avatar"
					type="file"
					hidden
					accept=".jpg,.jpeg,.gif,.png,.svg"
					onChange={e => upload(e.target.files)} />
			</label>
		</div>
	)
}

export default ChangeImgPath