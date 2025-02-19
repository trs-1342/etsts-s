import sys
import json
import os

def main():
    try:
        # Argümanlardan JSON verisini al
        data = json.loads(sys.argv[1])
        
        # Kaydetmek için dosya yolu
        # "../kayitlar/{fishNo}.json" formatında olacak
        fish_no = data.get('fishNo', 'unknown')
        file_path = os.path.join('..', 'kayitlar', f"{fish_no}.json")

        # Dosya yolunun doğru olduğundan emin ol
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # JSON verisini dosyaya kaydet
        with open(file_path, "w") as file:
            json.dump(data, file, indent=4)

        print(f"Veri başarıyla {file_path} dosyasına kaydedildi")

    except Exception as e:
        print(f"Hata: {str(e)}", file=sys.stderr)

if __name__ == "__main__":
    main()
