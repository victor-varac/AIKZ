use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use zip::write::FileOptions;

fn main() -> zip::result::ZipResult<()> {
    let msi_path = "../../src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_1.0.21_x64_en-US.msi";
    let zip_path = "../../src-tauri/target/release/bundle/msi/AIKZ.Sistema.de.Gestion_1.0.21_x64_en-US.msi.zip";

    println!("Reading MSI from: {}", msi_path);
    let mut f = File::open(msi_path).expect("File not found");
    let mut buffer = Vec::new();
    f.read_to_end(&mut buffer).expect("Failed to read file");

    println!("Creating ZIP at: {}", zip_path);
    let path = Path::new(zip_path);
    let file = File::create(&path).unwrap();

    let mut zip = zip::ZipWriter::new(file);

    let options = FileOptions::default()
        .compression_method(zip::CompressionMethod::Stored)
        .unix_permissions(0o755);

    zip.start_file("AIKZ Sistema de Gestión_1.0.21_x64_en-US.msi", options)?;
    zip.write_all(&buffer)?;
    zip.finish()?;

    println!("Zip created successfully!");
    Ok(())
}
