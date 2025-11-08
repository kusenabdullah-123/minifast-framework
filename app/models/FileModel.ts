export class FileModel {
  getAll() {
    return [{ id: 1, name: 'Laporan.pdf' }];
  }

  getById(id: string) {
    return { id, name: `File-${id}.pdf` };
  }
}
