import React , { FC, useState } from 'react'
import { Modal } from '../../modal/index'
import { MRT_ColumnDef } from 'material-react-table';
import { TextField } from '@mui/material'

export const NewBrandModal: FC<{
    columns: MRT_ColumnDef<any>[];
    onClose: () => void;
	onSubmit: (values:any) => void;
	open: boolean;
}> = ({ columns, open, onClose, onSubmit }) => {

    const [values, setValues] = useState<any>(() =>
		columns.reduce((acc, column) => {
			acc[column.accessorKey ?? ''] = '';
			return acc;
		}, {} as any),
	);

    const onSubmitModal = () => {
        onSubmit(values)
    }

    return (
        <Modal open={open} onClose={onClose} onSubmit={onSubmitModal}>
            <>
                {columns.map((column, index) => 
                    <TextField
                        key={index}
                        label={column.header}
                        name={column.accessorKey}
                        variant="outlined"
                        onChange={(e) =>
                            setValues({ ...values, [e.target.name]: e.target.value })
                        }
                    />
                )}
            </>
        </Modal>
    )
}