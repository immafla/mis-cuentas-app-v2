import React, { useMemo, useCallback, useState, useEffect } from 'react'
import {
    Button,
    DialogActions,
    DialogContent, 
    Typography,
    IconButton,
    AppBar,
    Toolbar,
} from '@mui/material'
import CloseIcon from "@mui/icons-material/Close";
import { validateRequired, validateEmail, validateAge } from '../../../utils'
import { brandColumns } from "./columns";
import {
    MaterialReactTableProps,
    MRT_Cell,
    MRT_ColumnDef,
    MRT_Row,
} from 'material-react-table';
import CustomTable from "@/components/Table";
import { NewBrandModal } from '../../molecules'
import Dialog from '@mui/material/Dialog';
import { IActionsModal } from './interface';
import { ApiService } from '../../../services/api.service';
import { createBrand, deleteBrandById, updateBrandById } from '@/services/brands.service';

export const NewBrand = ({open,setOpen}:IActionsModal) => {
    const api = new ApiService()
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState<any[]>(()=> [{}]);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    const handleSaveRowEdits: MaterialReactTableProps<any>['onEditingRowSave'] =
        async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            await updateBrandById(row.original._id, values.name)
            setTableData((prev) =>
                prev.map((item, index) =>
                    index === row.index
                        ? { ...item, name: values.name.toUpperCase() }
                        : item,
                ),
            );
            exitEditingMode();
        }
    };

    const validateBrandIsUsed = async (idBrand: any) => {

    }

    const handleDeleteRow = useCallback(async (row: MRT_Row<any>) => {
            if (!confirm(`Seguro quiere borrar la marca ${row.getValue('name')}`)) {
                console.log({row})
                return;
            }
            // if(validateBrandIsUsed(row.original._id)){
            // console.log('el id: ',row.original._id)
            // }
            await deleteBrandById(row.original._id)
            tableData.splice(row.index, 1);
            setTableData([...tableData]);
        },
        [tableData],
    );

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const getCommonEditTextFieldProps = useCallback((cell: unknown) => {
        const typedCell = cell as MRT_Cell<any>;
        return {
            error: !!validationErrors[typedCell.id],
            helperText: validationErrors[typedCell.id],
            onBlur: (event: any) => {
                const isValid =
                    typedCell.column.id === 'email'
                    ? validateEmail(event.target.value)
                    : typedCell.column.id === 'age'
                    ? validateAge(+event.target.value)
                    : validateRequired(event.target.value);
                if (!isValid) {
                //set validation error for cell if invalid
                setValidationErrors({
                    ...validationErrors,
                    [typedCell.id]: `${typedCell.column.columnDef.header} is required`,
                });
            } else {
                //remove validation error for cell if valid
                delete validationErrors[typedCell.id];
                setValidationErrors({
                    ...validationErrors,
                });
            }
                },
        }
    },[validationErrors]);

    const handleCreateNewRow = async (values: any) => {
        if(values.name === ''){
            alert('El nombre es obligatorio')
            return
        }
        setIsLoading(true);
        await createBrand(values.name)
        setTableData([...tableData, {name: values.name.toUpperCase()}]);
        setIsLoading(false);
    };

    const columns = useMemo<MRT_ColumnDef<any>[]>(
        () =>
          brandColumns(
            getCommonEditTextFieldProps,
          ),
        [getCommonEditTextFieldProps, validationErrors],
      );

    useEffect(()=> {
        (async ()=>{
            setIsLoading(true)
            const brands = await api.getAllBrands()
            const brandsData = await brands.json()
            setTableData(brandsData)
            setIsLoading(false)
        })()
    },[])

    return (
        <Dialog 
            open={open} 
            onClose={() => setOpen()}
            fullWidth={true}
            maxWidth={'sm'}
        >
            <AppBar sx={{ position: "relative" }}>
                <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={setOpen}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    Marcas
                </Typography>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <CustomTable
                    columns={columns}
                    tableData={tableData}
                    isLoading={isLoading}
                    handleSaveRowEdits={handleSaveRowEdits}
                    handleCancelRowEdits={handleCancelRowEdits}
                    handleDeleteRow={handleDeleteRow}
                    setCreateModalOpen={setCreateModalOpen}
                />
                <NewBrandModal
                    columns={columns}
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSubmit={handleCreateNewRow}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => setOpen()}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}