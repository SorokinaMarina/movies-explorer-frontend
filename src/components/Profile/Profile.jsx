import React from "react";
import './Profile.css';
import Header from "../Header/Header";
import { Link } from 'react-router-dom';
import { editProfile } from '../../utils/MainApi';
import {validationProfile} from '../../utils/validation';
import {CurrentUserContext} from '../../contexts/CurrentUserContext';
import InfoTooltip from "../InfoTooltip/InfoTooltip";

function Profile (props) {

    const [isClicked, setIsClicked] = React.useState(false); // Переменная для переключения "редактировать" и "сохранить"
    const currentUser = React.useContext(CurrentUserContext); // Достаём данные пользователя из контекста

    //Переменная, отвечающая за открытие/закрытие попапа успешного редактирования
    const [isSuccess, setIsSuccess] = React.useState(false);

    //Создаём переменные, в которые будут записываться значения из полей ввода
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');

    //Создаём переменную с объектом, в который будет записываться валидность каждого поля ввода
    const [isFormValidity, setIsFormValidity] = React.useState({ emailValid: false, nameValid: false });
    const emailValidity = isFormValidity.emailValid;
    const nameValidity = isFormValidity.nameValid;

    //Создаём переменную, которая проверит всю  форму на валидность
    const formValid = emailValidity && nameValidity;

    //Переменная записывает ошибку
    const [submitText, setSubmitText] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [nameError, setNameError] = React.useState('');

    //Создаём переменную, которая проверяет состояние фокуса у полей ввода
    const [isFocused, setIsFocused] = React.useState(false);

    //Условие для валидности кнопки "Сохранить"
    const saveButtonValidity = (name !== currentUser.name && email !== currentUser.email) || (name !== currentUser.name && email === currentUser.email) || (name === currentUser.name && email !== currentUser.email);

    //Этот useEffect записывает данные в поля ввода
    React.useEffect(() => {
        setName(currentUser.name);
        setEmail(currentUser.email)
    }, [currentUser])

    //Этот useEffect запускает функцию валидации
    React.useEffect(() => {
        validationProfile({email, name, setEmailError, setNameError, setIsFormValidity, isFocused})
    }, [email, name, setIsFormValidity, setIsFocused])

    //Создаём функции, которые будут записывать значения каждого поля ввода в соответствующую переменную
    function handleNameChange (e) {
        setName(e.target.value);
    }

    function handleEmailChange (e) {
        setEmail(e.target.value);
    }

    //Функции меняют состояние переменной isClicked по клику на кнопку "Редактировать" и "Сохранить"
    function handleButtonEditClick () {
        setIsClicked(true);
    }

    //Функция отвечает за выход из аккаунта
    function signOut () {
        props.setIsLoggedIn(false);
        props.setSavedFilms([]);
        localStorage.removeItem('token');
        localStorage.removeItem('films');
        localStorage.removeItem('textSearch');
        localStorage.removeItem('filteredFilms');
        localStorage.removeItem('checked');
        localStorage.removeItem('checkedSave');
    }

    //Функция, отвечающая за отправку данных на сервер
    function handleSubmit (e) {
        e.preventDefault();
        props.setIsLoading(true);

        editProfile(name, email)
        .then(data => {
            if(data.email && data.name) {
                setIsClicked(false);
                props.setCurrentUser(data);
                setIsSuccess(true);
            } else if (data === 409) {
                setSubmitText('Пользователь с таким email уже существует.')
            } else {
                setSubmitText('При обновлении профиля произошла ошибка.')
            }
        })
        .catch(err => {
            props.setIsLoading(false);
            return `Возникла ошибка: ${err}`;
        })
    }

    //Функции, меняющие состояние фокуса на полях ввода
    function handleFocus () {
        setIsFocused(true);
    }

    function handleBlur () {
        setIsFocused(false);
    }

    return (
        <>   
            <Header isLoggedIn={props.isLoggedIn} />
            <main className="profile" id='profile-form'>
                <section className="profile__section" >
                    <h1 className="profile__title">{`Привет, ${currentUser.name}`}</h1>
                    <form className="profile__form" name='profile-form' action="#" id='profile-form' onSubmit={handleSubmit} noValidate>
                        <fieldset className="profile__info">
                            <label className="profile__label" htmlFor="name"> Имя
                                <input className={`profile__input ${isClicked ? 'profile__input_border' : ''}`} 
                                    id='name' 
                                    type="text"
                                    placeholder={isFocused ? name : currentUser.name}
                                    minLength='2' maxLength='30'
                                    required
                                    disabled={!isClicked}
                                    value={name || ''}
                                    onChange={handleNameChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur} />
                                    <span className="profile__error-input">{nameError}</span>
                            </label>
                        </fieldset>
                        <fieldset className="profile__info">
                            <label className="profile__label" htmlFor="email"> E-mail
                                <input  className={`profile__input ${isClicked ? 'profile__input_border' : ''}`} 
                                    id='email' 
                                    type="email"
                                    placeholder={isFocused ? email : currentUser.email}
                                    minLength='2' maxLength='30'
                                    required
                                    disabled={!isClicked}
                                    value={email || ''}
                                    onChange={handleEmailChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur} />
                                    <span className="profile__error-input">{emailError}</span>
                            </label>
                        </fieldset>

                        {!isClicked ? 
                        <div className="profile__button-container">          
                            <button className="profile__button-edit" type='button' onClick={handleButtonEditClick}>Редактировать</button>
                            <Link className="profile__link" to='/' onClick={signOut}>Выйти из аккаунта</Link>
                        </div>
                        :
                        <div className="profile__button-save-container">
                            <span className="profile__error">{submitText}</span>
                            <button className={`profile__button-save ${ !saveButtonValidity || !formValid || props.isLoading ? 'profile__button-save_disabled' : ''}`} disabled={!saveButtonValidity || !formValid || props.isLoading} type="submit" >Сохранить</button>
                        </div>}
                    </form>
                </section>
                <InfoTooltip isSuccess={isSuccess} setIsSuccess={setIsSuccess} />

            </main>
        </>
    )
}

export default Profile;