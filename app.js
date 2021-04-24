let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', () => iniciarApp());

function iniciarApp() {
    mostrarServicios();
    // Resalta el div actual según cuál se selecciona
    mostrarSeccion();
    // Oculta o muestra la seccion según el tab que se presiona
    cambiarSeccion();
    // Paginacion siguiente y anterior
    paginaSiguiente();

    paginaAnterior();

    // Comprobar la pagina actual para ocultar o mostrar la paginación

    botonesPaginador();

    //Mostrar el resumen de cita o error en caso de no completar los campos
    mostrarResumen();

    // Almacena el nombre de la cita en el objeto

    nombreCita();

    // Almacena la fecha en el objeto
    fechaCita();
    deshabilitarFechaAnterior();

    // Almacena la hora en el objeto
    horaCita();
    
}

function mostrarSeccion() {
    // Eliminar seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if (seccionAnterior) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }

    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    // Eliminar la clase de actual en el tab anterior
    const tabAnterior = document.querySelector('.tabs .actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    // Resaltar el tab actual

    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            
            pagina = parseInt(e.target.dataset.paso);

            mostrarSeccion();

            botonesPaginador();
        })
    } )
}

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();

        const {servicios} = db;

        // Generamos el HTML

        servicios.forEach( servicio => {
            const { id, nombre, precio } = servicio;

            // DOM scripting

            // Generamos nombre de servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            // Generamos el precio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');
            
            // Generamos el div contenedor de los servicios

            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            // Seleccionar un servicio para la cita

            servicioDiv.onclick = seleccionarServicio;

            // Inyectar precio y nombre al div

            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            // Inyectarlo en el html

            document.querySelector('#servicios').appendChild(servicioDiv);
        } )
    } catch (error) {
        console.log(error);
    }
}

// Con esta funcion forzamos a que el elemento que se le de click sea el DIV

function seleccionarServicio(e) {
    let elemento;

    if(e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }

    if(elemento.classList.contains('seleccionado')) {
        elemento.classList.remove('seleccionado');

        const id = parseInt( elemento.dataset.idServicio );

        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');
        
        const servicioSeleccionado = {
            id: parseInt( elemento.dataset.idServicio ),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.lastElementChild.textContent
        }

        agregarServicio(servicioSeleccionado);
    }

}

function eliminarServicio(id) {
    const {servicios} = cita;

    cita.servicios = servicios.filter( servicio => servicio.id !== id );

    console.log(cita);
}

function agregarServicio(objeto) {
    const {servicios} = cita;

    cita.servicios = [...servicios, objeto];

    console.log(cita);
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;

        botonesPaginador();
    })
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;

        console.log(pagina);

        botonesPaginador();
    })
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if(pagina === 1) {
        paginaAnterior.classList.add('ocultar');
    } else if(pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        mostrarResumen(); // Al estar en la pagina 3 debemos cargar el resumen de la cita
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion(); //Cambia la seccion por la de la pagina
    cambiarSeccion();
}

function mostrarResumen() {
    // Destructuring

    const { nombre, fecha, hora, servicios } = cita;

    const divResumen = document.querySelector('#paso-3');

    // Limpiar el HTML previo

    while(divResumen.firstChild) {
        divResumen.removeChild(divResumen.firstChild);
    }

    // Validacion

    if(Object.values(cita).includes('')) {
        const noHayServicios = document.createElement('P');
        noHayServicios.textContent = 'Faltan datos de servicios, hora, fecha o nombre.'
        noHayServicios.classList.add('invalidar-cita');

        divResumen.appendChild(noHayServicios);

        return;
    } 

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de cita';
    
    // Mostrar el resumen

    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de servicios solicitados';

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;

    // Iterar sobre el array de servicios

    servicios.forEach(servicio => {
        const { nombre, precio } = servicio;

        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');

        cantidad += parseInt(totalServicio[1].trim());

        // Adjuntarlo al HTML

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    })

    divResumen.appendChild(headingCita);
    divResumen.appendChild(nombreCita);
    divResumen.appendChild(fechaCita);
    divResumen.appendChild(horaCita);
    divResumen.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a pagar:</span> $${cantidad}`;
    
    divResumen.appendChild(cantidadPagar);
}


function nombreCita() {
    const nombreInput = document.querySelector('#nombre');
    
    nombreInput.addEventListener('input', e => {
        const nombreTexto = e.target.value.trim();

        // validacion de que el texto contenga algo

        if(nombreTexto === '' || nombreTexto.length < 3) {
            mostrarAlerta('El nombre no es valido');
        } else {
            const alerta = document.querySelector('.alerta');

            if(alerta) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
    })
}

function mostrarAlerta(mensaje) {

    const alertaPrevia = document.querySelector('.alerta');

    if(alertaPrevia) {
        return;
    }

    const alerta = document.createElement('DIV');

    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    // Insertamos en el HTML

    const form = document.querySelector('.formulario');

    form.appendChild( alerta );

    setTimeout( () => {
        alerta.remove();
    }, 3000)
}

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');

    fechaInput.addEventListener('input', e => {
        const dia = new Date(e.target.value).getUTCDay();

        if([0, 1].includes(dia)) {
            e.preventDefault;
            fechaInput.value = '';
            mostrarAlerta('¡Solo atendemos de martes a sabados!');
        } else {
            cita.fecha = fechaInput.value;

            // console.log(cita);
        }
    })
}

function deshabilitarFechaAnterior() {
    const fechaInput = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;
    const dia = fechaAhora.getDate();

    const fechasDeshabilitadas = `${dia}-${mes}-${year}`;

    
    fechaInput.setAttribute('min', fechasDeshabilitadas);

    console.log(fechaInput);
}

function horaCita() {
    const inputHora = document.querySelector('#hora');

    inputHora.addEventListener('input', e => {
        const horaCita = e.target.value;
        const hora = horaCita.split(':');

        if(hora[0] < 10 || hora[0] > 18) {
            mostrarAlerta('Solo atendemos de 10 a 18hs');
            setTimeout(() => {
                inputHora.value = '';
            }, 2000);
        } else {
            cita.hora = horaCita;

            console.log(cita);
        }
    })
}