import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss'],
})
export class AddCompanyComponent implements OnInit {
  error: string | undefined;
  myForm!: FormGroup;
  isLoading = false;
  id: string | undefined;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.id) {
      this.initData(this.id);
    }
  }

  async initData(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('companies').doc(id).ref.get();
      const data = response.data();
      if (data) {
        this.fillForm(data);
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  private createForm() {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      owner: [''],
      description: [''],
      streetAddress: ['', Validators.required],
      references: [''],
    });
  }

  fillForm(data: any) {
    this.myForm.setValue({
      name: data && data.name ? data.name : '',
      phone: data && data.phone ? data.phone : '',
      owner: data && data.owner ? data.owner : '',
      description: data && data.description ? data.description : '',
      streetAddress: data && data.streetAddress ? data.streetAddress : '',
      references: data && data.references ? data.references : '',
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
    });
    toast.present();
  }

  close() {
    this.modalController.dismiss({ modification: false });
  }

  async add(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      this.createSearchLabels([String(this.myForm.get('name').value), String(this.myForm.get('phone').value)]);
      let data: any = this.myForm.value;
      data.nameStr = String(data.name).toLocaleLowerCase();
      data.search = this.createSearchLabels([
        String(this.myForm.get('name').value),
        String(this.myForm.get('phone').value),
      ]);
      data.date = new Date();
      const response: DocumentReference = await this.afs.collection('companies').add(data);
      if (response.id) {
        this.close();
        this.presentToast('Empresa agregada correctamente');
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async update(id: string): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = this.myForm.value;
      data.nameStr = String(data.name).toLocaleLowerCase();
      data.search = this.createSearchLabels([
        String(this.myForm.get('name').value),
        String(this.myForm.get('phone').value),
      ]);
      await this.afs.collection('companies').doc(id).update(data);
      this.close();
      this.presentToast('Empresa actualizada correctamente');
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  createSearchLabels(searchTerms: string[]): string[] {
    let chars = {
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
      à: 'a',
      è: 'e',
      ì: 'i',
      ò: 'o',
      ù: 'u',
      ñ: 'n',
      Á: 'A',
      É: 'E',
      Í: 'I',
      Ó: 'O',
      Ú: 'U',
      À: 'A',
      È: 'E',
      Ì: 'I',
      Ò: 'O',
      Ù: 'U',
      Ñ: 'N',
    };
    let expr1 = /[áàéèíìóòúùñ]/gi;
    let expr2 = /[`~!@#$%^&*()_|+\-=?;:'",.<>´\{\}\[\]\\\/]/gi;
    let tempArray: string[] = [];
    const unique = (value: any, index: any, self: any) => {
      return self.indexOf(value) === index;
    };
    for (let i = 0; i < searchTerms.length; i++) {
      const str = searchTerms[i];

      const strToLowerCase = str.toLocaleLowerCase();
      const strSinAcentos = str.replace(expr1, function (e) {
        return chars[e];
      });
      const toLocaleLCSA = strToLowerCase.replace(expr1, function (e) {
        return chars[e];
      });
      const strNoEspChar = str.replace(expr2, '');
      const toLocaleLCEP = toLocaleLCSA.replace(expr1, function (e) {
        return chars[e];
      });
      const includeAll = str
        .toLocaleLowerCase()
        .replace(expr1, function (e) {
          return chars[e];
        })
        .replace(expr2, '');

      const strNoWhite1 = str.replace(/\s/g, '');
      const strNoWhite2 = strToLowerCase.replace(/\s/g, '');
      const strNoWhite3 = strSinAcentos.replace(/\s/g, '');
      const strNoWhite4 = strNoEspChar.replace(/\s/g, '');
      const strNoWhite5 = toLocaleLCSA.replace(/\s/g, '');
      const strNoWhite6 = toLocaleLCEP.replace(/\s/g, '');
      const strNoWhite7 = includeAll.replace(/\s/g, '');

      const array1 = str.split(' ');
      const array2 = strToLowerCase.split(' ');
      const array3 = strSinAcentos.split(' ');
      const array4 = strNoEspChar.split(' ');
      const array5 = strSinAcentos.split(' ');
      const array6 = strNoEspChar.split(' ');
      const array7 = includeAll.split(' ');

      tempArray.push(str);
      tempArray.push(strToLowerCase);
      tempArray.push(strSinAcentos);
      tempArray.push(strNoEspChar);
      tempArray.push(toLocaleLCSA);
      tempArray.push(toLocaleLCEP);
      tempArray.push(includeAll);

      tempArray.push(strNoWhite1);
      tempArray.push(strNoWhite2);
      tempArray.push(strNoWhite3);
      tempArray.push(strNoWhite4);
      tempArray.push(strNoWhite5);
      tempArray.push(strNoWhite6);
      tempArray.push(strNoWhite7);

      tempArray = tempArray.concat(array1);
      tempArray = tempArray.concat(array2);
      tempArray = tempArray.concat(array3);
      tempArray = tempArray.concat(array4);
      tempArray = tempArray.concat(array5);
      tempArray = tempArray.concat(array6);
      tempArray = tempArray.concat(array7);
    }
    const minLenght: number = 5;
    tempArray = tempArray.filter(unique);
    let tempArray2: string[] = [];
    for (let i = 0; i < tempArray.length; i++) {
      const str = tempArray[i];
      if (str.length > minLenght) {
        for (let ii = str.length; ii >= minLenght; ii--) {
          tempArray2.push(str.substring(0, ii));
        }
      }
    }
    tempArray = tempArray.concat(tempArray2);
    tempArray = tempArray.filter(unique);
    tempArray = tempArray.filter((element) => {
      if (element.length >= minLenght) {
        return element;
      }
    });
    return tempArray;
  }

  save() {
    if (this.id) {
      this.update(this.id);
    } else {
      this.add();
    }
  }
}
