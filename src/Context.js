import React, { Component } from 'react';
import {storeProducts, detailProduct} from './data';
const ProductContext = React.createContext();

class ProductProvider extends Component {
    state = {
        product:[],
        detailProduct:detailProduct,
        cart : [],
        modalOpen : false,
        modalProduct : detailProduct,
        cartSubtotal : 0,
        cartTax : 0,
        cartTotal : 0
    }
    componentDidMount(){
        this.setProduct();
    }
    setProduct = () => {
        let tempProducts = [];
        storeProducts.forEach(item => {
            const singleItem = {...item};
            tempProducts = [...tempProducts, singleItem];
        });
        this.setState(() => {
            return {product:tempProducts};
        });
    }

    getItem = id => {
        const product = this.state.product.find(item=> item.id === id);
        return product;
    }

    handleDetail = id => {
        const product = this.getItem(id);
        this.setState(() => {
            return {detailProduct:product}
        })
    }
    addToCart = id => {
        let tempProducts = [...this.state.product];
        const index = tempProducts.indexOf(this.getItem(id));
        const product = tempProducts[index];
        product.inCart = true;
        product.count = 1;
        const price = product.price;
        product.total = price;
        this.setState(()=> {
            return {product:tempProducts, cart:[...this.state.cart,product]};
        },
        ()=> {
            this.addTotals();
        }
        )
    }
    openModal = id => {
        const product = this.getItem(id);
        this.setState(()=>{
            return {modalProduct:product, modalOpen:true}
        })
    }
    closeModal = id => {
        this.setState(()=>{
            return {modalOpen:false}
        })
    }
    increase = id => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find(item=> item.id === id)
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];

        product.count = product.count + 1;
        product.total = product.count * product.price;

        this.setState(()=>{
            return {cart:[...tempCart]}
        },
        ()=>{
            this.addTotals();
        })
    }
    decrease = id => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find(item=> item.id === id)
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];

        product.count = product.count - 1;
        if(product.count===0){
            this.removeItem(id);
        }else {
            product.total = product.count * product.price;
            this.setState(()=>{
                return {cart:[...tempCart]}
            },
            ()=>{
                this.addTotals();
            })
        }
    }
    removeItem = id => {
        let tempProducts = [...this.state.product];
        let tempCart = [...this.state.cart];

        tempCart = tempCart.filter(item => item.id !== id);

        const index = tempProducts.indexOf(this.getItem(id)); //untuk mendapatkan id yang di pilih
        let removeProduct = tempProducts[index];
        removeProduct.inCart = false;
        removeProduct.count = 0;
        removeProduct.total = 0;

        this.setState(()=>{
            return {
                cart : [...tempCart],
                product : [...tempProducts]
            };
        }, ()=>{
            this.addTotals();
        })
    }
    clearCart = () => {
        this.setState(()=>{
            return {cart:[]};
        },()=>{
            this.setProduct();
            this.addTotals();
        });
    }
    addTotals = () => {
        let subtotal = 0;
        this.state.cart.map(item =>(subtotal += item.total));
        const tempTax = subtotal * 0.1;
        const tax = parseFloat(tempTax.toFixed(2));
        const total = subtotal + tax;
        this.setState(()=>{
            return {
                cartSubtotal : subtotal,
                cartTax : tax,
                cartTotal : total
            }
        })
    }
    render() {
        return (
            <ProductContext.Provider value={{...this.state, handleDetail:this.handleDetail, addToCart:this.addToCart, openModal:this.openModal, closeModal:this.closeModal,
                increase : this.increase,
                decrease : this.decrease,
                removeItem : this.removeItem,
                clearCart : this.clearCart
            }}>
                {this.props.children}
            </ProductContext.Provider>
        );
    }
}

const ProductConsumer = ProductContext.Consumer;

export {ProductProvider,ProductConsumer};