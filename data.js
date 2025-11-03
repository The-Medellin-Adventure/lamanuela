window.APP_DATA = {
  scenes: {
    barco: {
      name: 'Paseo en Barco',
      image: null,
      video: 'videos/escena1.mp4',
      color: 0x4A90E2,
      initialRotation: { x: 0, y: 0, z: 0 },
      avatarText:
        'Bienvenidos al paseo en barco por nuestra hermosa represa. Aquí podrás disfrutar de paisajes únicos y la tranquilidad del agua.',
      hotspots: [
        {
          position: { x: 200, y: 0, z: -300 },
          icon: '🌊',
          title: 'Vista de la Represa',
          text: 'Esta represa tiene más de 50 años de historia. Es hogar de diversas especies de aves acuáticas y peces.',
          voiceText:
            'Mirá, esta represa tiene más de cincuenta años de historia, parce. Acá viven un montón de aves acuáticas y peces. Es un lugar súper tranquilo, ¿viste?',
          media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }
          ]
        },
        {
          position: { x: -250, y: 50, z: 200 },
          icon: '🦜',
          title: 'Fauna Local',
          text: 'En esta zona puedes observar garzas, patos silvestres y ocasionalmente águilas pescadoras.',
          voiceText:
            'Uy, hermano, en esta zona podés ver garzas, patos silvestres y a veces hasta águilas pescadoras. Es un espectáculo bacano cuando vienen por la mañana.',
          media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800' }
          ]
        }
      ]
    },

    entrada: {
      name: 'Entrada',
      image: null,
      video: null,
      color: 0x50C878,
      initialRotation: { x: 0, y: 0, z: 0 },
      avatarText:
        'Esta es la entrada principal de nuestra finca recreacional. Desde aquí comienza tu aventura en la naturaleza.',
      hotspots: [
        {
          position: { x: 150, y: -50, z: -350 },
          icon: '🏡',
          title: 'Casa Principal',
          text: 'Nuestra casa principal cuenta con 5 habitaciones, sala de estar amplia y todas las comodidades modernas en medio de la naturaleza.',
          voiceText:
            'Esta es la casa principal, parce. Tiene cinco habitaciones bien amplias, sala de estar grande y todas las comodidades que necesitás. Todo rodeado de pura naturaleza, ¿sí ve?',
          media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800' }
          ]
        },
        {
          position: { x: -200, y: 30, z: 250 },
          icon: '🐴',
          title: 'Caballerizas',
          text: 'Contamos con 8 caballos de diferentes razas. Ofrecemos paseos guiados por los senderos de la finca.',
          voiceText:
            'Acá tenemos ocho caballos, hermano, de diferentes razas. Hacemos paseos guiados por todos los caminos de la finca. Es una experiencia súper chévere.',
          media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800' }
          ]
        },
        {
          position: { x: 0, y: 100, z: -400 },
          icon: '🌳',
          title: 'Senderos Naturales',
          text: 'Más de 3 kilómetros de senderos ecológicos que conectan diferentes puntos de interés en la finca.',
          voiceText:
            'Mirá, tenemos más de tres kilómetros de senderos ecológicos que conectan todos los sitios bacanos de la finca. Podés caminar tranquilo y disfrutar del paisaje.',
          media: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800' }
          ]
        }
      ]
    }
  }
};
