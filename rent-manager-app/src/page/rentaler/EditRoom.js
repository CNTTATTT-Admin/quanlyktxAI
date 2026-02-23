import { Navigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import RoomService from "../../services/axios/RoomService";
import { toast } from 'react-toastify';
import { getRoom } from '../../services/fetch/ApiUtils';
import PlacesWithStandaloneSearchBox from './map/StandaloneSearchBox';

function EditRoom(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();

    const [roomData, setRoomData] = useState({
        title: '',
        description: '',
        price: 0,
        latitude: 0.0,
        longitude: 0.0,
        address: '',
        locationId: 0,
        categoryId: 0,
        assets: [
            { name: '', number: '' }
        ],
        files: [],
        waterCost: 0,
        publicElectricCost: 0,
        internetCost: 0
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setRoomData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRemoveAsset = (indexToRemove) => {
        setRoomData(prevState => ({
            ...prevState,
            assets: prevState.assets.filter((asset, index) => index !== indexToRemove)
        }));
    }

    const handleAssetChange = (event, index) => {
        const { name, value } = event.target;
        setRoomData(prevState => ({
            ...prevState,
            assets: prevState.assets?.map((asset, i) =>
                i === index ? { ...asset, [name]: value } : asset
            )
        }));
    };
    // const handleAssetChange = (event, index) => {
    //     const { name, value } = event.target;
    //     setRoomData(prevState => ({
    //         ...prevState,
    //         assets: (prevState.assets || []).map((asset, i) =>
    //             i === index ? { ...asset, [name]: value } : asset
    //         )
    //     }));
    // };

    const handleFileChange = (event) => {
        setRoomData(prevState => ({
            ...prevState,
            files: [...prevState.files, ...event.target.files]
        }));
    };

    useEffect(() => {
        getRoom(id)
            .then(response => {
                const room = response;
                console.log("room", room);
                setRoomData(prevState => ({
                    ...prevState,
                    ...room
                }));
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, [id]);

    const setLatLong = (lat, long, address) => {
        console.log("lat", lat);
        setRoomData((prevRoomData) => ({
            ...prevRoomData,
            latitude: lat,
            longitude: long,
            address: address,
        }));
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("SUBMIT")

        const formData = new FormData();
        formData.append('title', roomData.title);
        formData.append('description', roomData.description);
        formData.append('price', roomData.price);
        formData.append('latitude', roomData.latitude);
        formData.append('longitude', roomData.longitude);
        formData.append('address', roomData.address);
        formData.append('locationId', roomData.locationId);
        formData.append('categoryId', roomData.categoryId);
        formData.append('asset', roomData.assets.length);
        formData.append('waterCost', roomData.waterCost);
        formData.append('publicElectricCost', roomData.publicElectricCost);
        formData.append('internetCost', roomData.internetCost);
        roomData.assets.forEach((asset, index) => {
            formData.append(`assets[${index}][name]`, asset.name);
            formData.append(`assets[${index}][number]`, asset.number);
        });
        roomData.files.forEach((file, index) => {
            formData.append(`files`, file);
        });
        RoomService.updateRoom(id, formData)
            .then(response => {
                toast.success(response.message);
                toast.success("Cập nhật thông tin phòng thành công.");
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });

        console.log(roomData);
    };
    console.log("roomData", roomData);
    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }
    return (
        <>
            <div className="wrapper">
                <nav id="sidebar" className="sidebar js-sidebar">
                    <div className="sidebar-content js-simplebar">
                        <a className="sidebar-brand" href="index.html">
                            <span className="align-middle">RENTALER PRO</span>
                        </a>
                        <SidebarNav />
                    </div>
                </nav>

                <div className="main">
                    <Nav onLogout={onLogout} currentUser={currentUser} />

                    <br />
                    <div className="container-fluid p-0">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Cập nhật thông tin phòng</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="title">Tiều đề phòng</label>
                                            <input type="text" className="form-control" id="title" name="title" value={roomData.title} onChange={handleInputChange} />
                                        </div>
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="description">Mô tả</label>
                                            <input type="text" className="form-control" id="description" name="description" value={roomData.description} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Giá</label>
                                        <input type="number" className="form-control" id="price" name="price" value={roomData.price} onChange={handleInputChange} />
                                    </div>
                                    {/* <div className="mb-3">
                                        <label className="form-label" htmlFor="waterCost">Tiền nước</label>
                                        <input type="number" className="form-control" id="waterCost" name="waterCost" value={roomData.waterCost} onChange={handleInputChange} />
                                    </div> */}
                                    {/* <div className="mb-3">
                                        <label className="form-label" htmlFor="publicElectricCost">Tiền điện chung</label>
                                        <input type="number" className="form-control" id="publicElectricCost" name="publicElectricCost" value={roomData.publicElectricCost} onChange={handleInputChange} />
                                    </div> */}
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="internetCost">Tiền mạng</label>
                                        <input type="number" className="form-control" id="internetCost" name="internetCost" value={roomData.internetCost} onChange={handleInputChange} />
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="locationId">Khu vực</label>
                                            <select className="form-select" id="locationId" name="locationId" value={roomData.locationId} onChange={handleInputChange}>
                                                <option value={0}>Chọn...</option>
                                                <option value={1}>Hà Nội</option>
                                            </select>
                                        </div>
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="address">Địa Chỉ</label>
                                            <input type="text" className="form-control" id="address" name="address" value={roomData.address} onChange={handleInputChange} />
                                            {/* <PlacesWithStandaloneSearchBox latLong={setLatLong} /> */}
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="categoryId">Danh mục</label>
                                            <select className="form-select" id="categoryId" name="categoryId" value={roomData.categoryId} onChange={handleInputChange}>
                                                <option value={0}>Chọn...</option>
                                                <option value={1}>Bất động sản</option>
                                                <option value={2}>Phòng trọ</option>
                                                <option value={3}>Chung cư mini</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3">
                                            <label className="form-label">Tải Hình Ảnh</label>
                                            <br/>
                                            {roomData.roomMedia?.map((media, index) => (
                                                <img src={"http://localhost:8080/document/"+media.files} style={{width : "10%", marginLeft : "10px", border: "1px"}}/>
                                            ))}
                                            <input className="form-control" type="file" name="files" multiple onChange={handleFileChange} />
                                        </div>
                                    </div>
                                    <div className="card-header">
                                        <h5 className="card-title">Tài sản của phòng</h5>
                                    </div>
                                    <br />
                                    {roomData.assets?.map((asset, index) => (
                                        <div key={index} className="row">
                                            <div className="mb-3 col-md-6">
                                                <label className="form-label" htmlFor={`assetName${index}`}>Tên tài sản {index + 1}</label>
                                                <input type="text" className="form-control" id={`assetName${index}`} name="name" value={asset.name} onChange={(event) => handleAssetChange(event, index)} />
                                            </div>
                                            <div className="mb-3 col-md-4">
                                                <label className="form-label" htmlFor={`assetNumber${index}`}>Số lượng</label>
                                                <input type="number" className="form-control" id={`assetNumber${index}`} name="number" value={asset.number} onChange={(event) => handleAssetChange(event, index)} />
                                            </div>
                                            <div className="col-md-2">
                                                <button type="button" style={{ marginTop: "34px" }} className="btn btn-danger" onClick={() => handleRemoveAsset(index)}>Xóa tài sản</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-primary" onClick={() => setRoomData(prevState => ({ ...prevState, assets: [...prevState.assets, { name: '', number: '' }] }))}>Thêm tài sản</button>
                                    <br /><br />
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            </div >

        </>
    )
}

export default EditRoom;