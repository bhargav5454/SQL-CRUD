import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct, fetchProduct, updateProduct } from '../../ReduxToolkit/Slice/Product.slice';
import { Edit, Trash2, X } from 'lucide-react';
import './Product.css'
import axios from 'axios';

const ProductList = () => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [quantities, setQuantities] = useState({});
    const dispatch = useDispatch();
    const { product } = useSelector((state) => state.productData);

    useEffect(() => {
        dispatch(fetchProduct({ endpoint: '/product/getAll' }));
    }, [dispatch]);

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProduct({ endpoint: `/product/update`, productId: editingProduct.id, payload: editingProduct }));
        setEditModalOpen(false);
    };

    const handleDelete = (productId) => {
        dispatch(deleteProduct({ endpoint: `/product/delete`, productId }));
    };

    const handleAddtoCart = (item) => {
        const payload = {
            productId: item.id,
            quantity: quantities[item.id] || 1 // Default to 1 if not set
        };
        axios.post('http://localhost:8001/v1/cart/add', payload, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkMDgyY2UzLTRmMTAtNDVlNi04ZDZkLTZmOGVhZDI3MjhmOCIsImlhdCI6MTcyOTgzMTc5NCwiZXhwIjoxNzI5ODM1Mzk0fQ.ANbszrSVFQ3Us9wE13eLegIWpYF-JFwPdZ0s-5R9k9c',
                'x-custom-access-id': '8d082ce3-4f10-45e6-8d6d-6f8ead2728f8'
            }
        });
    };

    const incrementQuantity = (item) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [item.id]: Math.min((prevQuantities[item.id] || 1) + 1, item.quantity)
        }));
    };

    const decrementQuantity = (item) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [item.id]: Math.max((prevQuantities[item.id] || 1) - 1, 1)
        }));
    };

    const handleQuantityChange = (e, item) => {
        const value = Math.max(1, Math.min(Number(e.target.value), item.quantity)); // Ensure value is between 1 and item.quantity
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [item.id]: value
        }));
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <h1 className="text-3xl font-bold mb-6">Product List</h1>
            {product?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {product?.map((item, ind) => (
                        <Fragment key={ind}>
                            <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4">
                                <div className="relative mb-4">
                                    <div className="absolute top-4 right-4 flex space-x-2">
                                        <button
                                            className="text-gray-600 hover:text-blue-500"
                                            aria-label="Edit Product"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            className="text-gray-600 hover:text-red-500"
                                            aria-label="Delete Product"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-lg font-bold">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    <p className="text-sm text-gray-500">Category: {item.category}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    <p className="text-2xl font-bold mt-4">${item.price.toFixed(2)}</p>

                                    {/* Quantity Counter */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className="px-3 py-1 bg-gray-300 rounded"
                                            onClick={() => decrementQuantity(item)}
                                            disabled={quantities[item.id] === 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantities[item.id] || 1}
                                            onChange={(e) => handleQuantityChange(e, item)}
                                            className="w-12 text-center border border-gray-300 rounded"
                                            min="1"
                                            max={item.quantity}
                                        />
                                        <button
                                            className="px-3 py-1 bg-gray-300 rounded"
                                            onClick={() => incrementQuantity(item)}
                                            disabled={quantities[item.id] >= item.quantity}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        className="text-white bg-gray-700 hover:bg-green-600 rounded-lg text-sm px-4 py-2 mt-3"
                                        onClick={() => handleAddtoCart(item)}
                                    >
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                        </Fragment>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white border border-gray-200 rounded-lg">
                    <p className="text-gray-500">No products added yet.</p>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-transform duration-300 scale-95 opacity-0 animate-modalIn border-2 ">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold">Edit Product</h2>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 " >
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="edit-name"
                                        value={editingProduct.name}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 focus:ring-opacity-50 p-3 text-lg"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        id="edit-description"
                                        rows="3"
                                        value={editingProduct.description}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 focus:ring-opacity-50 p-3 text-lg"
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        id="edit-price"
                                        value={editingProduct.price}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 focus:ring-opacity-50 p-3 text-lg"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        id="edit-category"
                                        value={editingProduct.category}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 focus:ring-opacity-50 p-3 text-lg"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="home-appliances">Home Appliances</option>
                                        <option value="books">Books</option>
                                        <option value="toys">Toys</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        id="edit-quantity"
                                        value={editingProduct.quantity}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 focus:ring-opacity-50 p-3 text-lg"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            )}


        </div>
    );
};

export default ProductList;

