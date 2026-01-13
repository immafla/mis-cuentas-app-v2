import React, { useMemo, useCallback, useState, useEffect } from 'react'
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle, 
    Box,
    Tooltip,
    IconButton
} from '@mui/material'
import { validateRequired, validateEmail, validateAge } from '../../../utils'
import MaterialReactTable, {
    MaterialReactTableProps,
    MRT_Cell,
    MRT_ColumnDef,
    MRT_Row,
} from 'material-react-table';

import { Delete, Edit, AddCircle } from '@mui/icons-material';

import { data, categories, brands } from '../product/makeData';

import { NewBrandModal } from '../../molecules'

import { MRT_Localization_ES } from 'material-react-table/locales/es';

import Dialog, { DialogProps } from '@mui/material/Dialog';
import { IActionsModal } from './interface';
import { ApiService } from '../../../services/api.service';

export const NewBrand = ({open,setOpen}:IActionsModal):JSX.Element => {
    const api = new ApiService()
    const [name, setName] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState<any[]>(()=> [{}]);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    const handleSaveRowEdits: MaterialReactTableProps<any>['onEditingRowSave'] =
        async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            tableData[row.index] = values;
            setTableData([...tableData]);
            exitEditingMode();
        }
    };

    const validateBrandIsUsed = async (idBrand) => {

    }


    const handleDeleteRow = useCallback(async (row: MRT_Row<any>) => {
            // if (!confirm(`Are you sure you want to delete ${row.getValue('name')}`)) {
            //     console.log({row})
            //     return;
            // }
            // if(validateBrandIsUsed(row.original._id)){

            // }
            const response = await api.deleteBrand({_id:row.original._id})
            console.log({response})
            console.log(row.original)
            //send api delete request here, then refetch or update local table data for re-render
            // tableData.splice(row.index, 1);
            // setTableData([...tableData]);
        },
        [tableData],
    );

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const getCommonEditTextFieldProps = useCallback((cell: MRT_Cell<any>,) : MRT_ColumnDef<any>['muiTableBodyCellEditTextFieldProps'] => {
        return {
            error: !!validationErrors[cell.id],
            helperText: validationErrors[cell.id],
            onBlur: (event) => {
                const isValid =
                    cell.column.id === 'email'
                    ? validateEmail(event.target.value)
                    : cell.column.id === 'age'
                    ? validateAge(+event.target.value)
                    : validateRequired(event.target.value);
                if (!isValid) {
                //set validation error for cell if invalid
                setValidationErrors({
                    ...validationErrors,
                    [cell.id]: `${cell.column.columnDef.header} is required`,
                });
            } else {
                //remove validation error for cell if valid
                delete validationErrors[cell.id];
                setValidationErrors({
                    ...validationErrors,
                });
            }
                },
        }
    },[validationErrors]);

    const columns = useMemo<MRT_ColumnDef<any>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Nombre de la marca',
                size: 140,
                muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                    variant:"outlined",
                    ...getCommonEditTextFieldProps(cell),
                }),
            }
        ],
        [getCommonEditTextFieldProps],
    );

    const handleCreateNewRow = async (values: any) => {
        tableData.push(values);
        const addNewBrand = await api.setBrand(values)
        const addNewBrandData = await addNewBrand.json()
        if(addNewBrandData.acknowledged){
            setTableData([...tableData]);
        }
    };

    const saveBrand = async () => {
        const bussines = await api.setBussines({name})
        const response = await bussines.json()
        if(response){
            setOpen()
            setName('')
        }
    }

    useEffect(()=> {
        (async ()=>{
            const brands = await api.getAllBrands()
            const brandsData = await brands.json()
            setTableData(brandsData)
        })()
    },[])

    return (
        <Dialog 
            open={open} 
            onClose={() => setOpen()}
            fullWidth={true}
            maxWidth={'sm'}
        >
            <DialogTitle>Ingresa el nombre de la marca</DialogTitle>
            <DialogContent>
                <MaterialReactTable
					positionActionsColumn="last"
					muiTableBodyRowProps={{ hover: false }}
					enableDensityToggle={false}
					enableFullScreenToggle={false}
					enableHiding={false}
					enableRowOrdering={false}
					enableColumnFilters={false}
					enableSorting={false}
					initialState={{ density: 'compact' }}
					editingMode="modal"
					localization={MRT_Localization_ES}
					columns={columns}
                    data={tableData}
                    enableEditing
                    onEditingRowSave={handleSaveRowEdits}
                    onEditingRowCancel={handleCancelRowEdits}
                    displayColumnDefOptions={{
						'mrt-row-actions': {
								header: 'Editar marca',
								muiTableHeadCellProps: {
									align: 'left'
								},
								size: 20,
						},
                    }}
					muiSearchTextFieldProps={{
						placeholder: 'Buscar marcas',
						sx: { minWidth: '400px' },
						variant: 'outlined',
					}}
                    renderRowActions={({ row, table }) => (
                        <Box sx={{ display: 'flex', gap: '1rem' }}>
                            <Tooltip arrow placement="left" title="Editar">
                                <IconButton onClick={() => table.setEditingRow(row)}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Borrar">
                                <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
					)}
                    renderTopToolbarCustomActions={() => (
						<Button
							color="primary"
							onClick={() => setCreateModalOpen(true)}
							variant="contained"
						>
							<Box sx={{ display: 'flex', gap: '1rem' }}>
								<AddCircle color="secondary"/>  Crear marca
							</Box>
						</Button>
                    )}
                />
                <NewBrandModal
                    columns={columns}
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSubmit={handleCreateNewRow}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setOpen()}>Cancelar</Button>
                <Button variant="contained" onClick={() => saveBrand()}>Crear</Button>
            </DialogActions>
        </Dialog>
    )
}