import { useContext } from 'react';
import { GlobalContext } from '../context';

// import styles from './custom.module.css';

export default function Dashboard() {
    const { globalstate, update, save, reset } = useContext(GlobalContext);

    return (
        <div style={{ height:"100%", width:"100%" }}>
            <iframe src="/" style={{ height:"100%", width:"100%" }}/>
            <button onClick={()=>update({
                ...globalstate, wow:{ ...globalstate.wow, count:globalstate.wow.count+1 }                
            })}>inc count</button>
            <button onClick={()=>reset()}>reset</button>
            <button onClick={()=>save()}>save</button>
        </div>
    );
};