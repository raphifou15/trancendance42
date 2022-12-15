import React from "react";
import { ClassementInterface } from "../interfaces/Classement";

interface Props{
    classement: ClassementInterface;
}

const TableBodyTr: React.FC<Props> = ({classement}: Props): JSX.Element => {

    return (
        <tr className="classement_tr">
            <td className="classement_thead_td classement_td_first">{classement.place}</td>
            <td className="classement_thead_td classement_td_first">{classement.login}</td>
            <td className="classement_thead_td classement_td_first">{classement.victories}</td>
            <td className="classement_thead_td classement_td_first">{classement.defeats}</td>
        </tr>
    )
}

export default TableBodyTr;
