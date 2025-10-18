// Утилита для сжатия изображений
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            // Вычисляем новые размеры
            let { width, height } = img

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height
                    height = maxHeight
                }
            }

            // Устанавливаем размеры canvas
            canvas.width = width
            canvas.height = height

            // Рисуем изображение на canvas
            ctx.drawImage(img, 0, 0, width, height)

            // Конвертируем в blob
            canvas.toBlob(resolve, 'image/jpeg', quality)
        }

        img.src = URL.createObjectURL(file)
    })
}

// Утилита для загрузки файла на Firebase Storage
export const uploadToFirebase = async (file, path) => {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const { storage } = await import('../lib/firebase')

    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
}

