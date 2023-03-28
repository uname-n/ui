import { useContext } from 'react';
import { GlobalContext } from '../context';

import styles from './custom.module.css';

export default function Plugin() {
    const { globalstate } = useContext(GlobalContext);

    return (
        <div>{JSON.stringify(globalstate, null, 2)}</div>
    );
}
