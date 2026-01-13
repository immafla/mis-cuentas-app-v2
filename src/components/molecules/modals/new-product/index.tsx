import React , { FC, useState, useEffect, SetStateAction } from 'react'
import { Modal } from '../../modal/index'
import { MRT_ColumnDef } from 'material-react-table';
import OutlinedInput from '@mui/material/OutlinedInput';
import styles from './styles.module.css';
import {
    MenuItem,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Box,
    InputAdornment
} from '@mui/material'
// import { Product } from '../../../pages/product/interface';
import { ApiService } from '../../../../services/api.service'
import { Product } from '@/interfaces';

export const NewProductModal: FC<{
    columns: MRT_ColumnDef<Product>[];
    onClose: () => void;
	onSubmit: (values:any) => void;
	open: boolean;
}> = ({ columns, open, onClose, onSubmit }) => {

    const apiService = new ApiService

    const [brandList, setBrandList] = useState<any[]>([])

    const [bussinesCategoryList, setBussinesCategoryList] = useState<any[]>([])

    const [brandSelected, setBrandSelected] = useState(
        {
            label: '',
            value: ''
        },
    )

    const [categorySelected, setCategorySelected] = useState(
        {
            label: '',
            value: ''
        },
    )

    const [values, setValues] = useState<any>(() =>
		columns.reduce((acc, column) => {
			acc[column.accessorKey ?? ''] = '';
			return acc;
		}, {} as any),
	);

    const onSubmitModal = () => {
        onSubmit({
            ...values,
            amount: 0,
            brand: brandSelected.value,
            category: categorySelected.value
        })
    }

    const getBrandList = async () => {
        try{
            const productsResponse = await (await apiService.getAllBrands()).json()
            if(productsResponse){
                setBrandList(productsResponse.map((el:any) => ({
                    value: el._id,
                    label: el.name
                })));
            }
        }catch(e){
            console.log('Error al obtener las marcas =>', {e})
        }
    }

    const getBussinesCategoryList = async () => {
        try{
            const bussinesCategoryResponse = await (await apiService.getAllBussinesCategory()).json();
            if(bussinesCategoryResponse){
                setBussinesCategoryList(bussinesCategoryResponse.map((el:any) => ({
                    value: el._id,
                    label: el.name
                })));
            }
        }catch(e){
            console.log('Error al obtener las marcas =>', {e})
        }
    }

    useEffect(()=>{
        getBussinesCategoryList()
        getBrandList()    
    },[])

    useEffect(()=>{
        console.log({values})
    },[values])

    return (
        <Modal open={open} onClose={onClose} onSubmit={onSubmitModal}>
            <Box className={styles.container}> 
                {columns.map((column, index) => {
                    return(
                        column.accessorKey != 'amount' &&
                        column.accessorKey != 'brand' &&
                        column.accessorKey != 'category' ? 
                        column.accessorKey == 'sale_price' ? (
                            <FormControl 
                                key={index} 
                                fullWidth 
                                className={column.accessorKey as string}
                                id={column.accessorKey as string}
                                //name={column.accessorKey as string}
                                >
                                <InputLabel htmlFor="outlined-adornment-amount">{column.header}</InputLabel>
                                <OutlinedInput
                                    key={index}
                                    id={column.accessorKey as string}
                                    name={column.accessorKey as string}
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                    label={column.header}
                                    onChange={(e) =>
                                        setValues({ ...values, [e.target.name]: e.target.value })
                                    }
                                />
                            </FormControl>
                        ) : (
                            <TextField
                                className={column.accessorKey as string}
                                key={index}
                                id={column.accessorKey as string}
                                label={column.header}
                                name={column.accessorKey as string}
                                variant="outlined"
                                onChange={(e) =>
                                    setValues({ ...values, [e.target.name]: e.target.value })
                                }
                            />
                        ) : null
                    )
                })}

                <FormControl fullWidth>
                    <InputLabel id="brand-label">Marca</InputLabel>
                    <Select
                        labelId="brand-label"
                        id="brand"
                        value={brandSelected.value}
                        label="Brand"
                        onChange={(event)=> setBrandSelected(event.target as SetStateAction<any>)}
                        >
                            {brandList.map((element, index)=>(
                                <MenuItem 
                                    key={index} 
                                    value={element.value}
                                    >
                                        {element.label}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="category-label">Categoria</InputLabel>
                    <Select
                        labelId="category-label"
                        id="category"
                        value={categorySelected.value}
                        label="Category"
                        onChange={(event)=> setCategorySelected(event.target as SetStateAction<any>)}
                        >
                            {bussinesCategoryList.map((element, index)=>(
                                <MenuItem 
                                    key={index} 
                                    value={element.value}
                                    >
                                        {element.label}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Box>
        </Modal>
    )
}
