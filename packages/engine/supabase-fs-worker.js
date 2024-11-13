// import { makeId } from './util.js';

//

export class SupabaseFsWorker {
  constructor({
    supabase,
    bucketName = 'mirror',
  }) {
    if (!supabase) {
      throw new Error('no supabase client');
    }

    this.supabase = supabase;
    this.bucketName = bucketName;
  }

  getUrl(keyPath) {
    const u = keyPath.join('/')
    const {
      data,
    } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(u);
    const {publicUrl} = data;
    return publicUrl;
  }

  async getUserId() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user.id;
  }

  async readFile(keyPath) {
    const u = this.getUrl(keyPath);
    const res = await fetch(u);
    if (res.ok) {
      const blob = await res.blob();
      return blob;
    } else {
      console.warn('readFile not ok', u, res.status);
      return null;
    }
  }
  async writeFile(keyPath, value) {
    const u = keyPath.join('/');
    const opts = {
      upsert: true,
    };
    const result = await this.supabase
      .storage
      .from(this.bucketName)
      .upload(u, value, opts);
    if (!result.error) {
      const u2 = this.getUrl(keyPath);
      return u2;
    } else {
      throw new Error(result.error);
    }
  }
  async deleteFile(keyPath) {
    const u = keyPath.join('/');
    await this.supabase
      .storage
      .from(this.bucketName)
      .remove([u]);
  }

  async readDirectory(keyPath) {
    const u = keyPath.join('/');
    const {
      data,
      error,
    } = await supabase
      .storage
      .from(this.bucketName)
      .list(u, {
        // limit: 100,
        // offset: 0,
        sortBy: {
          column: 'name',
          order: 'asc',
        },
      });
    const fileNames = data.map(file => file.name);
    return fileNames;
  }
  async readAllFiles(keyPath) {
    const fileNames = await this.readDirectory(keyPath);
    const files = await Promise.all(fileNames.map(async fileName => {
      const arrayBuffer = await this.readFile(keyPath.concat([fileName]));
      return arrayBuffer;
    }));
    return files;
  }
  async clearDirectory(keyPath) {
    const fileNames = await this.readDirectory(keyPath);
    await Promise.all(fileNames.map(async fileName => {
      await this.deleteFile(keyPath.concat([fileName]));
    }));
  }

  async getFileSize(keyPath) {
    const u = this.getUrl(keyPath);
    const res = await fetch(u, {
      method: 'HEAD',
    });
    const sizeString = res.headers.get('Content-Length');
    const size = parseInt(sizeString, 10);
    return size;
  }
  async getDirectorySize(keyPath) {
    const fileNames = await this.readDirectory(keyPath);
    return fileNames.length;
  }
}