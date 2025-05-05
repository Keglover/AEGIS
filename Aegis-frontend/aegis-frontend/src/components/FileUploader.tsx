import { ChangeEvent, useState } from 'react'
import Button from "./Button";
import Alert from './Alert';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const FileUploader = () =>
{
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<UploadStatus>('idle')

    function handleFileChange(e: ChangeEvent<HTMLInputElement>)
    {
        if(e.target.files)
        {
            setFile(e.target.files[0]);
        }
    }
    
    async function handleFileUpload()
    {
        if(!file || status === 'uploading') return;

        if(file.name != "pom.xml")
        {
            console.log("Bad File");
            return;
        }
        
        setStatus('uploading');
        console.log("Uploading " + file.name);

        // Change to JSON and POST to backend

        // Catch errors
        // setStatus('error');

        setStatus('success');

        setStatus('idle');
    }

    return (
        <div className='space-y-4'>
            {file && file.name !== "pom.xml" &&
                <div><Alert>Invalid File Name (Must be 'pom.xml')</Alert></div>
            }

            <input type="file" onChange={handleFileChange} />

            {status !== 'uploading' &&
                <Button onClick={handleFileUpload}>Upload POM File</Button>
            }
        </div>
    );
}

export default FileUploader