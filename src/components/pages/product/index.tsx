import React, { FC, useState, useMemo, useCallback, useEffect } from 'react'
import { validateRequired, validateEmail, validateAge } from '../../../utils'
import Chip from '@mui/material/Chip';
import { ApiService } from '../../../services/api.service'
import {
    Button,
    Typography,
    DialogActions,
    DialogContent,
    DialogTitle, 
    Box,
    Tooltip,
    IconButton,
    MenuItem,
		AppBar,
    Toolbar,
    FormControl,
    InputLabel,
    Select
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import MaterialReactTable, {
    MaterialReactTableProps,
    MRT_Cell,
    MRT_ColumnDef,
    MRT_Row,
  } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Delete, Edit, AddCircle } from '@mui/icons-material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import { IActionsModal, Product } from './interface';

import { NewProductModal } from '../../molecules'

export const NewProduct = ({open,setOpen}: IActionsModal) => {
  const apiService = new ApiService
	const [tableData, setTableData] = useState<Product[]>([]);
	const [brands, setAllBrands] = useState<any[]>([]);
	const [categories, setAllCategories] = useState<any[]>([]);
  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState<DialogProps['maxWidth']>('lg');
	const [createModalOpen, setCreateModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
      [cellId: string]: string;
    }>({});

  const handleSaveRowEdits: MaterialReactTableProps<Product>['onEditingRowSave'] =
      async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
          tableData[row.index] = values;
          setTableData([...tableData]);
          exitEditingMode();
      }
  };

  const addItemsToInventary = (data:any) => {
    console.log(data)
  }

  const handleCancelRowEdits = () => {
      setValidationErrors({});
    };

  const handleDeleteRow = useCallback(
    (row: MRT_Row<Product>) => {
      if (
        !confirm(`Are you sure you want to delete ${row.getValue('name')}`)
      ) {
        return;
      }
      //send api delete request here, then refetch or update local table data for re-render
      tableData.splice(row.index, 1);
      setTableData([...tableData]);
    },
    [tableData],
  );

	const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<Product>,
    ): MRT_ColumnDef<Product>['muiTableBodyCellEditTextFieldProps'] => {
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
      };
    },
    [validationErrors],
  );

	const handleCreateNewRow = async (values: any) => {
    try{
      const productsResponse: Product[] = await (await apiService.setProduct(values)).json()
      if(productsResponse){
        const parseValues = {
          ...values,
          brand: parseBrand(values.brand).name,
          category: parseCategory(values.category).name
        }
        setTableData([...tableData, parseValues]);
      }
    }catch(e){
      console.log('Error al guardar el producto =>', {e})
    }
  };

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre del producto',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
					variant:"outlined",
          ...getCommonEditTextFieldProps(cell),
        }),
      },
			{
        accessorKey: 'brand',
        header: 'Marca',
        size: 40,
        muiTableBodyCellEditTextFieldProps:{
					variant:"outlined",
          select: true, //change to select for a dropdown
          children: brands.map((brand) => (
            <MenuItem key={brand._id} value={brand.name}>
              {brand.name}
            </MenuItem>
          )),
        },
      },
			{
        accessorKey: 'amount',
        header: 'Disponibles',
        size: 2,
				enableEditing: false,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
					variant:"outlined",
          ...getCommonEditTextFieldProps(cell),
        }),
				Cell: ({ cell }) => {
          const value = cell.getValue<number>()
          return (
          <Chip 
            icon={<AddCircleIcon />} 
            sx={{'minWidth': '4rem', 'cursor': 'pointer'}}
            color={ value < 10 ? 'error' : value >= 10 && value < 20 ? 'warning': "success" } 
            label={value} 
            onClick={ () => addItemsToInventary(cell.row.original)}
          />
				)},
      },
			{
        accessorKey: 'category',
        header: 'Categoria',
				size: 40,
        muiTableBodyCellEditTextFieldProps: {
					variant:"outlined",
          select: true, //change to select for a dropdown
          children: categories.map((category) => (
            <MenuItem key={category._id} value={category.name}>
              {category.name}
            </MenuItem>
          )),
        },
      },
			// {
      //   accessorKey: 'purchase_price',
      //   header: 'Precio de compra',
      //   size: 20,
      //   muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
			// 		variant:"outlined",
      //     ...getCommonEditTextFieldProps(cell),
      //     type: 'number',
      //   }),
			// 	Cell: ({ cell }) => (
			// 		<Box>
			// 			{cell.getValue<number>()?.toLocaleString?.('es-CO', {
			// 				style: 'currency',
			// 				currency: 'COP',
			// 				minimumFractionDigits: 0,
			// 				maximumFractionDigits: 0,
			// 			})}
			// 		</Box>
			// 	),
      // },
      {
        accessorKey: 'sale_price',
        header: 'Precio',
        size: 20,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
					variant:"outlined",
          ...getCommonEditTextFieldProps(cell),
          type: 'number',
        }),
				Cell: ({ cell }) => (
					<Box>
						{cell.getValue<number>()?.toLocaleString?.('es-CO', {
							style: 'currency',
							currency: 'COP',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
					</Box>
				),
      },
      {
        accessorKey: 'bar_code',
        header: 'Código',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
					variant:"outlined",
          ...getCommonEditTextFieldProps(cell),
        }),
      },
    ],
    [getCommonEditTextFieldProps],
  );

  const parseBrand = (brandCode: string) => {
    return brands.find(brand => brand._id == brandCode)
  }

  const parseCategory = (categoryCode: string) => {
    return categories.find(category => category._id == categoryCode)
  }

  const fetchListProducts = async () => {
    try{
      const products = await (await apiService.getAllProducts()).json();
      const productsParsed = products.map((element: Product) => {
        return {
          ...element,
          brand: parseBrand(element.brand).name,
          category: parseCategory(element.category).name
        }
      })
      
      setTableData(productsParsed)
    }catch(e){
      console.log('Error al obtener la lista de productos =>', {e})
    }
  }

  const getAllBrands = async () => {
    try{
      const brands = await (await apiService.getAllBrands()).json()
      setAllBrands(brands)
    }catch(e){
      console.log('Error al obtener las marcas =>', {e})
    }
  }

  const getAllCategories = async () => {
    try{
      const categoriesList = await (await apiService.getAllBussinesCategory()).json();
      console.log('categoriesList =>', {categoriesList})
      setAllCategories(categoriesList)
    }catch(e){
      console.log('Error al obtener las marcas =>', {e})
    }
  }

  useEffect(() => {
    getAllBrands()
    getAllCategories()
  },[])

  useEffect(()=>{
    if(brands.length && categories.length) fetchListProducts()
  },[brands, categories])

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen()}
      //fullWidth={fullWidth}
      //maxWidth={maxWidth}
      fullWidth={true}
      maxWidth={'lg'}
    >
      <AppBar sx={{ position: 'relative' }}>
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
                Inventario
            </Typography>
            <Button autoFocus color="inherit" onClick={setOpen}>
                Guardar
            </Button>
        </Toolbar>
      </AppBar>

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
								header: 'Editar producto',
								muiTableHeadCellProps: {
									align: 'left'
								},
								size: 20,
						},
          }}
					muiSearchTextFieldProps={{
						placeholder: 'Buscar productos',
						sx: { minWidth: '400px' },
						variant: 'outlined',
					}}
          renderRowActions={({ row, table }) => (
						<Box sx={{ display: 'flex', gap: '1rem' }}>
              <Tooltip arrow placement="left" title="Editr">
                  <IconButton onClick={() => table.setEditingRow(row)}>
                      <Edit />
                  </IconButton>
              </Tooltip>
              <Tooltip arrow placement="right" title="Delete">
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
							<Box sx={{ display: 'flex', flexDirection: 'row', alignItems:'left',justifyContent:'left' ,gap: '0.5rem' }}>
								<AddCircle color="secondary"/>Nuevo
							</Box>
						</Button>
          )}
        />
				<NewProductModal
					columns={columns}
					open={createModalOpen}
					onClose={() => setCreateModalOpen(false)}
					onSubmit={handleCreateNewRow}
				/>
      </DialogContent>
      <DialogActions>
          <Button variant="contained" onClick={() => setOpen()}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
