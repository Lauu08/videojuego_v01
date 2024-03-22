document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    let vanguardia = urlParams.get("vanguardia");

    const preguntasContainer = document.getElementById("preguntasContainer");
    const respuestasContainer = document.getElementById("respuestasContainer");

    let vidas = sessionStorage.getItem("vidas") || 3;
    let tiempoRestante = 60; // Tiempo en segundos

    fetch("assets/data/preguntas.json")
        .then((response) => response.json())
        .then((data) => {
            let preguntasVanguardia = data.filter(
                (pregunta) => pregunta.vanguardia === vanguardia
            );

            let preguntaIndex = 0;
            let aciertos = sessionStorage.getItem("aciertos") || 0;
            let errores = 0;

            if (
                vanguardia === "cubismo" &&
                sessionStorage.getItem("aciertos_cubismo") === null
            ) {
                sessionStorage.setItem("aciertos_cubismo", 0);
            }

            mostrarPregunta(preguntaIndex);

            function mostrarPregunta(index) {
                preguntasContainer.innerHTML = `
                    <h3>${preguntasVanguardia[index].pregunta}</h3>
                    <p>Aciertos: <span id="contadorAciertos">${aciertos}</span></p>
                    <p>Vidas: <span id="contadorVidas">${vidas}</span></p>
                    <p>Tiempo restante: <span id="contadorTiempo">${tiempoRestante}</span> segundos</p>
                `;
                respuestasContainer.innerHTML = "";

                const intervalId = setInterval(() => {
                    tiempoRestante--;
                    document.getElementById("contadorTiempo").textContent = tiempoRestante;
                    if (tiempoRestante === 0) {
                        clearInterval(intervalId);
                        mostrarModalSinVidas();
                    }
                }, 1000);

                preguntasVanguardia[index].respuestas.forEach((respuesta) => {
                    const respuestaBtn = document.createElement("button");
                    respuestaBtn.textContent = respuesta.text;
                    respuestaBtn.addEventListener("click", function () {
                        if (respuesta.correct) {
                            respuestaBtn.style.backgroundColor = "green";
                            aciertos++;
                            sessionStorage.setItem("aciertos", aciertos);
                            document.getElementById(
                                "contadorAciertos"
                            ).textContent = aciertos;
                        } else {
                            respuestaBtn.style.backgroundColor = "red";
                            errores++;
                        }

                        const respuestaButtons = document.querySelectorAll(
                            "#respuestasContainer button"
                        );
                        respuestaButtons.forEach(
                            (button) => (button.disabled = true)
                        );

                        setTimeout(() => {
                            clearInterval(intervalId);
                            preguntaIndex++;
                            if (preguntaIndex < preguntasVanguardia.length) {
                                mostrarPregunta(preguntaIndex);
                            } else {
                                const totalPreguntasSurrealismo = data.filter(
                                    (pregunta) =>
                                        pregunta.vanguardia === "surrealismo"
                                ).length;

                                const todasRespondidasCorrectamente =
                                    preguntasVanguardia
                                        .slice(0, totalPreguntasSurrealismo)
                                        .every((pregunta) =>
                                            pregunta.respuestas.some(
                                                (respuesta) => respuesta.correct
                                            )
                                        );

                                if (
                                    vanguardia === "surrealismo" &&
                                    todasRespondidasCorrectamente
                                ) {
                                    mostrarModalFinal();
                                } else {
                                    mostrarModal();
                                }
                            }
                        }, 1000);
                    });
                    respuestasContainer.appendChild(respuestaBtn);
                });
            }

            function mostrarModal() {
                const modal = document.createElement("div");
                modal.classList.add("modal");

                const modalContent = document.createElement("div");
                modalContent.classList.add("modal-content");

                const h2 = document.createElement("h2");
                h2.textContent = "¡Has respondido todas las preguntas!";
                modalContent.appendChild(h2);

                const aciertosP = document.createElement("p");
                aciertosP.textContent = `Aciertos: ${aciertos}`;
                modalContent.appendChild(aciertosP);

                const erroresP = document.createElement("p");
                erroresP.textContent = `Errores: ${errores}`;
                modalContent.appendChild(erroresP);

                const nextButton = document.createElement("button");
                nextButton.textContent =
                    errores === 0
                        ? "Pasar a la siguiente vanguardia"
                        : "Volver a repetir la vanguardia actual";
                nextButton.addEventListener("click", function () {
                    if (errores === 0) {
                        const vanguardias = [
                            ...new Set(
                                data.map((pregunta) => pregunta.vanguardia)
                            ),
                        ];
                        const currentIndex = vanguardias.indexOf(vanguardia);
                        const nextIndex =
                            (currentIndex + 1) % vanguardias.length;
                        vanguardia = vanguardias[nextIndex];
                        window.location.href = `preguntas.html?vanguardia=${vanguardia}`;
                    } else {
                        reiniciarAciertos();
                        restarVida();
                    }
                    document.body.removeChild(modal);
                });

                modalContent.appendChild(nextButton);

                const mapaButton = document.createElement("button");
                mapaButton.textContent = "Volver al main";
                mapaButton.addEventListener("click", function () {
                    window.location.href = "mapa.html";
                });
                modalContent.appendChild(mapaButton);

                modal.appendChild(modalContent);
                document.body.appendChild(modal);
            }

            function mostrarModalFinal() {
                const modal = document.createElement("div");
                modal.classList.add("modal");

                const modalContent = document.createElement("div");
                modalContent.classList.add("modal-content");

                const h2 = document.createElement("h2");
                h2.textContent = "¡ENHORABUENA!";
                modalContent.appendChild(h2);

                const p = document.createElement("p");
                p.textContent = "Has acertado todas las vanguardias";
                modalContent.appendChild(p);

                const volverButton = document.createElement("button");
                volverButton.textContent = "Volver al menú";
                volverButton.addEventListener("click", function () {
                    reiniciarContadores();
                    window.location.href = "menu.html";
                    document.body.removeChild(modal);
                });
                modalContent.appendChild(volverButton);

                modal.appendChild(modalContent);
                document.body.appendChild(modal);
            }

            function reiniciarAciertos() {
                preguntaIndex = 0;
                errores = 0;
                aciertos = 0;
                sessionStorage.setItem("aciertos", aciertos);
                document.getElementById("contadorAciertos").textContent =
                    aciertos;
                mostrarPregunta(preguntaIndex);
            }

            function restarVida() {
                vidas--;
                sessionStorage.setItem("vidas", vidas);
                document.getElementById("contadorVidas").textContent = vidas;
                if (vidas === 0) {
                    mostrarModalSinVidas();
                }
            }

            function mostrarModalSinVidas() {
                const modal = document.createElement("div");
                modal.classList.add("modal");

                const modalContent = document.createElement("div");
                modalContent.classList.add("modal-content");

                const h2 = document.createElement("h2");
                h2.textContent = "¡Te has quedado sin vidas!";
                modalContent.appendChild(h2);

                const volverButton = document.createElement("button");
                volverButton.textContent = "Volver al menú principal";
                volverButton.addEventListener("click", function () {
                    reiniciarContadores();
                    window.location.href = "mapa.html";
                    document.body.removeChild(modal);
                });
                modalContent.appendChild(volverButton);

                modal.appendChild(modalContent);
                document.body.appendChild(modal);
            }

            function reiniciarContadores() {
                sessionStorage.removeItem("aciertos");
                sessionStorage.removeItem("aciertos_vanguardia_anterior");
                sessionStorage.removeItem("aciertos_cubismo");
                sessionStorage.removeItem("vidas");
            }
        });
});
