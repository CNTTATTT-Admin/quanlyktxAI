import { Navigate } from 'react-router-dom';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getRentOfHome, getRoom } from '../../services/fetch/ApiUtils';
import ContractService from '../../services/axios/ContractService';


function AddContract(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;

    const [roomOptions, setRoomOptions] = useState([]);

    const [contractData, setContractData] = useState({
        name: '',
        roomId: '',
        nameRentHome: '',
        phone:'',
        numOfPeople: '',
        deadline: null,
        files: []
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        setContractData(prevState => ({
            ...prevState,
            files: [...prevState.files, ...event.target.files]
        }));
    };


    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', contractData.name);
        formData.append('roomId', contractData.roomId);
        formData.append('nameOfRent', contractData.nameRentHome);
        formData.append('numOfPeople', contractData.numOfPeople);
        formData.append('phone', contractData.phone);
        formData.append('deadlineContract', contractData.deadline);
        contractData.files.forEach((file, index) => {
            formData.append(`files`, file);
        });
        console.log(formData.getAll)
        ContractService.addNewContract(formData)
            .then(response => {
                toast.success(response.message);
                toast.success("Hợp đồng lưu thành công!!")

            })
            .then(data => {
                console.log(data);
                // Do something with the response data here
                setContractData({
                    name: '',
                    roomId: '',
                    nameRentHome: '',
                    phone:'',
                    numOfPeople: '',
                    deadline: null,
                    files: []
                });
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });

        console.log(contractData);
    };

    useEffect(() => {
        getRentOfHome()
            .then(response => {
                const room = response.content;
                setRoomOptions(room);
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, []);

    console.log("Add room", authenticated);
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
                                <h5 className="card-title">Thiết lập hợp đồng</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="title">Tên hợp đồng</label>
                                            <input type="text" className="form-control" id="title" name="name" value={contractData.name} onChange={handleInputChange} />
                                        </div>
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="description">Người thuê</label>
                                            <input type="text" className="form-control" id="description" name="nameRentHome" value={contractData.nameRentHome} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="title">Số lượng người</label>
                                            <input type="text" className="form-control" id="title" name="numOfPeople" value={contractData.numOfPeople} onChange={handleInputChange} />
                                        </div>
                                        <div className="mb-3 col-md-6">
                                            <label className="form-label" htmlFor="description">Số điện thoại</label>
                                            <input type="text" className="form-control" id="description" name="phone" value={contractData.phone} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="locationId">Chọn phòng</label>
                                        <select className="form-select" id="locationId" name="roomId" value={contractData.roomId} onChange={handleInputChange}>
                                            <option value="">Chọn...</option>
                                            {roomOptions.map(roomOption => (
                                                <option key={roomOption.id} value={roomOption.id}>{roomOption.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Thời Hạn Hợp Đồng</label>
                                        <input type="datetime-local" className="form-control" id="price" name="deadline" 
                                        onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="mb-3">
                                            <label className="form-label">Tải File Hợp Đồng</label> <br />
                                            <h6 className="card-subtitle text-muted">Tải mẫu hợp đồng để tạo hợp đồng với người thuê và đẩy lên lưu trữ trên hệ thống. Sau đó chuyển sang file .pdf để upload.<a href='https://image.luatvietnam.vn/uploaded/Others/2021/04/08/hop-dong-thue-nha-o_2810144434_2011152916_0804150405.doc'>Tải Mẫu</a></h6>

                                            <input className="form-control" type="file" accept=".pdf" name="files" multiple onChange={handleFileChange} />
                                        </div>
                                    </div>
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

export default AddContract;