export interface IActionsModal {
    open: boolean;
    setOpen: ()=> void;
}

export type Product = {
    bar_code: string;
    name: string;
    brand: string;
    category: string;
    purchase_price: number;
    sale_price: number;
    amount: number;
};

